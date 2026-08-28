"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <section className="pt-28 pb-20 px-6" style={{ background: "#1a2e2a", minHeight: "100vh" }}>
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🔜</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#f5f5f0" }}>Coming Soon</h2>
        <p className="mb-6" style={{ color: "#a8a89d" }}>
          Analytics will be available once you&apos;ve connected Google Analytics to your clients.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
