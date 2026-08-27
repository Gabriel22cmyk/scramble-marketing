"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <section className="pt-28 pb-20 px-6" style={{ background: "#f8fdfe", minHeight: "100vh" }}>
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#1e293b" }}>Reports Coming Soon</h2>
        <p className="mb-6" style={{ color: "#64748b" }}>
          Auto-generated weekly and monthly reports will appear here once clients are added.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
