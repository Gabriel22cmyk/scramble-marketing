"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
}

export default function ErrorAlert({ title = "Error", message, className }: ErrorAlertProps) {
  return (
    <div className={cn("flex gap-3 p-4 rounded-lg bg-danger-dim border border-danger/20", className)}>
      <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-danger">{title}</p>
        <p className="text-sm text-danger/80 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
