"use client";

import { IOSButton } from "@/components/ui/ios";
import { Download } from "lucide-react";
import { exportSessionsToCsv } from "@/lib/export-schedule";
import type { SessionRecord } from "@/types/session";

export function ExportScheduleButton({
  sessions,
  filename,
}: {
  sessions: SessionRecord[];
  filename: string;
}) {
  return (
    <IOSButton
      size="sm"
      variant="secondary"
      disabled={sessions.length === 0}
      onClick={() => exportSessionsToCsv(sessions, filename)}
    >
      <Download className="w-4 h-4 mr-1" />
      导出课表
    </IOSButton>
  );
}
