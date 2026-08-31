import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * GET /api/auth/google/callback
 * 
 * OAuth callback from Google. Exchanges auth code for tokens and stores them.
 * 
 * Query params:
 *   code: string — authorization code from Google
 *   state: string — clientId (passed during initiate)
 *   error?: string — if present, OAuth was denied
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // clientId
    const error = searchParams.get('error')

    // User denied access
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_error=${encodeURIComponent(error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_error=missing_code_or_state`
      )
    }

    const clientId = decodeURIComponent(state)

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken(code)
    if (!tokenResponse) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_error=token_exchange_failed`
      )
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      scope,
    } = tokenResponse

    // Get Google account info from access token
    const googleProfile = await getGoogleProfile(access_token)
    if (!googleProfile) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_error=profile_fetch_failed`
      )
    }

    // Store in Supabase
    const supabase = createAdminSupabaseClient()
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    const { error: upsertError } = await supabase
      .from('google_oauth_connections')
      .upsert([
        {
          client_id: clientId,
          google_account_email: googleProfile.email,
          google_account_id: googleProfile.id,
          access_token,
          refresh_token,
          token_expires_at: tokenExpiresAt,
          granted_scopes: scope,
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'client_id,google_account_id',
      })

    if (upsertError) {
      console.error('[OAuth callback] Supabase upsert failed:', upsertError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_error=db_error`
      )
    }

    // Log success
    await logAuditEvent(supabase, clientId, 'oauth_connected', {
      email: googleProfile.email,
      scopes: scope.split(' '),
    })

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_success=true&email=${encodeURIComponent(googleProfile.email)}`
    )
  } catch (error) {
    console.error('[OAuth callback]', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?oauth_error=internal_error`
    )
  }
}

/**
 * Exchange Google authorization code for access + refresh tokens
 */
async function exchangeCodeForToken(code: string) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      throw new Error('Missing Google OAuth secrets')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[Token exchange]', error)
    return null
  }
}

/**
 * Fetch Google profile info (email, id)
 */
async function getGoogleProfile(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      email: data.email,
      id: data.id,
      name: data.name,
    }
  } catch (error) {
    console.error('[Google profile fetch]', error)
    return null
  }
}

/**
 * Log audit event
 */
async function logAuditEvent(supabase: any, clientId: string, eventType: string, details: any) {
  try {
    // First get the connection ID
    const { data: connection } = await supabase
      .from('google_oauth_connections')
      .select('id')
      .eq('client_id', clientId)
      .single()

    if (!connection) return

    await supabase.from('google_oauth_audit').insert([
      {
        connection_id: connection.id,
        event_type: eventType,
        details,
      },
    ])
  } catch (error) {
    console.error('[Audit log]', error)
  }
}
