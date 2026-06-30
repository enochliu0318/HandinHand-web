export interface SessionRecord {
  id: string;
  subject: string;
  date: string;
  durationMinutes: number;
  notes: string | null;
  feedback: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  recurringScheduleId?: string | null;
  recordedBy?: string | null;
  student?: { name: string; grade?: string | null };
  teacher?: { user: { name: string } };
}
