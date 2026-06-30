import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Role } from "@/generated/prisma/client";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "yyyy年M月d日", { locale: zhCN });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "yyyy年M月d日 HH:mm", { locale: zhCN });
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "HH:mm", { locale: zhCN });
}

export function formatDurationMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} 小时`;
  return `${hours} 小时 ${mins} 分钟`;
}

export function formatScheduledRange(
  start: Date | string,
  durationMinutes: number
) {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
  return `${formatDateTime(startDate)} – ${formatTime(endDate)}`;
}

export const DAYS_OF_WEEK = [
  { value: 0, label: "周日" },
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
] as const;

export function getDashboardPath(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/dashboard";
    case "PARENT":
      return "/parent";
  }
}

export const SUBJECTS = [
  "数学",
  "英语",
  "语文",
  "物理",
  "化学",
  "编程",
  "美术",
  "音乐",
  "其他",
] as const;
