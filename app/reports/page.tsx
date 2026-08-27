"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Reports"
        subtitle="Coming soon"
      />

      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-text mb-2">Coming Soon</h2>
          <p className="text-text-muted mb-6">
            Reports will be available once you've added clients and connected their data sources.
          </p>
          <Link href="/" className="btn-primary flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
