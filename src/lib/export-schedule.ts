import {
  formatDateTime,
  formatDurationMinutes,
  formatScheduledRange,
  formatTime,
} from "@/lib/utils";
import type { SessionRecord } from "@/types/session";

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cell(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return escapeCsv(String(value));
}

export function exportSessionsToCsv(
  sessions: SessionRecord[],
  filename: string
) {
  const headers = [
    "计划上课时间",
    "科目",
    "时长",
    "老师",
    "学生",
    "年级",
    "实际上课开始",
    "实际上课结束",
    "课后反馈",
    "备注",
  ];

  const rows = sessions.map((s) => [
    formatScheduledRange(s.date, s.durationMinutes),
    s.subject,
    formatDurationMinutes(s.durationMinutes),
    s.teacher?.user.name ?? "",
    s.student?.name ?? "",
    s.student?.grade ?? "",
    s.actualStartAt ? formatDateTime(s.actualStartAt) : "",
    s.actualEndAt ? formatTime(s.actualEndAt) : "",
    s.feedback ?? "",
    s.notes ?? "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
