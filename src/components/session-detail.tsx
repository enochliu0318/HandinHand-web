"use client";

import { useState } from "react";
import {
  IOSCard,
  IOSBadge,
  IOSButton,
  IOSInput,
  IOSTextarea,
} from "@/components/ui/ios";
import {
  formatDateTime,
  formatDurationMinutes,
  formatScheduledRange,
  formatTime,
} from "@/lib/utils";
import type { SessionRecord } from "@/types/session";
import { ChevronDown, ChevronUp, Clock, MessageSquare, Trash2 } from "lucide-react";

interface SessionDetailProps {
  session: SessionRecord;
  mode: "teacher" | "parent" | "admin";
  onUpdate?: () => void;
  onDelete?: () => void;
}

function toLocalDatetimeValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionDetailCard({
  session,
  mode,
  onUpdate,
  onDelete,
}: SessionDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(session.feedback ?? "");
  const [actualStart, setActualStart] = useState(
    toLocalDatetimeValue(session.actualStartAt)
  );
  const [actualEnd, setActualEnd] = useState(
    toLocalDatetimeValue(session.actualEndAt)
  );
  const [saving, setSaving] = useState(false);

  const canEdit = mode === "teacher";

  async function save(fields: Record<string, string | null>) {
    setSaving(true);
    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setSaving(false);
    if (res.ok) {
      onUpdate?.();
    } else {
      const err = await res.json();
      alert(err.error || "保存失败");
    }
  }

  async function handleSaveFeedback() {
    await save({ feedback });
  }

  async function handleSaveActualTimes() {
    await save({
      actualStartAt: actualStart || null,
      actualEndAt: actualEnd || null,
    });
  }

  async function markNow(field: "actualStartAt" | "actualEndAt") {
    const now = new Date().toISOString();
    if (field === "actualStartAt") {
      setActualStart(toLocalDatetimeValue(now));
      await save({ actualStartAt: now });
    } else {
      setActualEnd(toLocalDatetimeValue(now));
      await save({ actualEndAt: now });
    }
  }

  return (
    <IOSCard className="!p-0 overflow-hidden">
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left active:opacity-80 transition-opacity"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <IOSBadge color="blue">{session.subject}</IOSBadge>
                <span className="text-sm text-ios-gray">
                  {formatDurationMinutes(session.durationMinutes)}
                </span>
                {session.recurringScheduleId && (
                  <IOSBadge color="gray">每周</IOSBadge>
                )}
                {session.feedback && !expanded && (
                  <IOSBadge color="green">有反馈</IOSBadge>
                )}
                {session.actualStartAt && !expanded && (
                  <IOSBadge color="orange">已记录</IOSBadge>
                )}
              </div>
              {mode !== "teacher" && session.teacher && (
                <p className="font-medium">老师：{session.teacher.user.name}</p>
              )}
              {mode !== "parent" && session.student && (
                <p className="font-medium">{session.student.name}</p>
              )}
              {session.student?.grade && (
                <p className="text-sm text-ios-gray">{session.student.grade}</p>
              )}
              <p className="text-sm text-ios-gray mt-1">
                {formatScheduledRange(session.date, session.durationMinutes)}
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-ios-gray shrink-0 mt-1" />
            ) : (
              <ChevronDown className="w-5 h-5 text-ios-gray shrink-0 mt-1" />
            )}
          </div>
        </button>
        {mode === "admin" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-ios-red p-1 shrink-0 mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-ios-separator pt-4">
          {session.notes && (
            <div>
              <p className="text-xs text-ios-gray uppercase tracking-wide mb-1">
                课程备注
              </p>
              <p className="text-sm">{session.notes}</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-ios-blue" />
              <p className="text-xs text-ios-gray uppercase tracking-wide">
                计划时间
              </p>
            </div>
            <p className="text-sm">
              {formatScheduledRange(session.date, session.durationMinutes)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-ios-orange" />
              <p className="text-xs text-ios-gray uppercase tracking-wide">
                实际上课时间
              </p>
            </div>
            {canEdit ? (
              <div className="space-y-3">
                <IOSInput
                  label="开始时间"
                  type="datetime-local"
                  value={actualStart}
                  onChange={(e) => setActualStart(e.target.value)}
                />
                <IOSInput
                  label="结束时间"
                  type="datetime-local"
                  value={actualEnd}
                  onChange={(e) => setActualEnd(e.target.value)}
                />
                <div className="flex gap-2 flex-wrap">
                  <IOSButton
                    size="sm"
                    variant="secondary"
                    onClick={() => markNow("actualStartAt")}
                    disabled={saving}
                  >
                    现在开始
                  </IOSButton>
                  <IOSButton
                    size="sm"
                    variant="secondary"
                    onClick={() => markNow("actualEndAt")}
                    disabled={saving}
                  >
                    现在结束
                  </IOSButton>
                  <IOSButton
                    size="sm"
                    onClick={handleSaveActualTimes}
                    disabled={saving}
                  >
                    保存时间
                  </IOSButton>
                </div>
              </div>
            ) : session.actualStartAt ? (
              <p className="text-sm">
                {formatDateTime(session.actualStartAt)}
                {session.actualEndAt
                  ? ` – ${formatTime(session.actualEndAt)}`
                  : "（进行中）"}
              </p>
            ) : (
              <p className="text-sm text-ios-gray">老师尚未记录</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-4 h-4 text-ios-green" />
              <p className="text-xs text-ios-gray uppercase tracking-wide">
                课后反馈
              </p>
            </div>
            {canEdit ? (
              <div className="space-y-2">
                <IOSTextarea
                  rows={4}
                  placeholder="记录本节课的学习内容、学生表现、作业建议..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <IOSButton
                  size="sm"
                  onClick={handleSaveFeedback}
                  disabled={saving}
                >
                  保存反馈
                </IOSButton>
              </div>
            ) : session.feedback ? (
              <p className="text-sm whitespace-pre-wrap">{session.feedback}</p>
            ) : (
              <p className="text-sm text-ios-gray">老师尚未填写反馈</p>
            )}
          </div>

          {mode === "admin" && session.recordedBy && (
            <p className="text-xs text-ios-gray">录入：{session.recordedBy}</p>
          )}
        </div>
      )}
    </IOSCard>
  );
}
