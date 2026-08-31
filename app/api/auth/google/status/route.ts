import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * GET /api/auth/google/status?clientId=...
 * 
 * Check if a client has connected Google OAuth and what scopes are granted.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('google_oauth_connections')
      .select('id, google_account_email, granted_scopes, is_active, token_expires_at, last_used_at')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json({
        connected: false,
        email: null,
        scopes: [],
      })
    }

    const scopes = data.granted_scopes.split(' ').filter(Boolean)
    const isExpired = new Date(data.token_expires_at) < new Date()

    return NextResponse.json({
      connected: true,
      email: data.google_account_email,
      scopes,
      isExpired,
      lastUsed: data.last_used_at,
      hasScopes: {
        searchConsole: scopes.some((s: string) => s.includes('search_console')),
        analyticsReadonly: scopes.some((s: string) => s.includes('analytics.readonly')),
        analyticsManage: scopes.some((s: string) => s.includes('analytics.manage')),
        ads: scopes.some((s: string) => s.includes('adwords')),
      },
    })
  } catch (error) {
    console.error('[OAuth status]', error)
    return NextResponse.json(
      { error: 'Failed to check OAuth status' },
      { status: 500 }
    )
  }
}
