import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "yyyy年M月d日", { locale: zhCN });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "yyyy年M月d日 HH:mm", { locale: zhCN });
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
