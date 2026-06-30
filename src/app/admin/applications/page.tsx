"use client";

import { useEffect, useState } from "react";
import { AdminPageTitle } from "@/components/admin-shell";
import {
  IOSCard,
  IOSButton,
  IOSBadge,
  IOSEmptyState,
  IOSInput,
} from "@/components/ui/ios";
import { UserPlus, Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "TEACHER" | "PARENT";
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const roleLabels = {
  TEACHER: "老师",
  PARENT: "家长",
};

const statusLabels = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [approveError, setApproveError] = useState("");

  async function load() {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApplications(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startApprove(app: Application) {
    setApprovingId(app.id);
    setPassword("");
    setChildName("");
    setApproveError("");
  }

  function cancelApprove() {
    setApprovingId(null);
    setPassword("");
    setChildName("");
    setApproveError("");
  }

  async function handleApprove(app: Application) {
    if (!password || password.length < 6) {
      setApproveError("请设置至少 6 位的初始密码");
      return;
    }

    setProcessingId(app.id);
    setApproveError("");

    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        password,
        childName: app.role === "PARENT" ? childName : undefined,
      }),
    });

    setProcessingId(null);

    if (res.ok) {
      cancelApprove();
      load();
      alert(
        `已通过申请。请将以下信息告知申请人：\n邮箱：${app.email}\n密码：${password}`
      );
    } else {
      const err = await res.json();
      setApproveError(err.error || "操作失败");
    }
  }

  async function handleReject(id: string) {
    if (!confirm("确定拒绝该申请？")) return;

    setProcessingId(id);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    setProcessingId(null);

    if (res.ok) {
      if (approvingId === id) cancelApprove();
      load();
    } else {
      const err = await res.json();
      alert(err.error || "操作失败");
    }
  }

  const pending = applications.filter((a) => a.status === "PENDING");

  return (
    <>
      <AdminPageTitle
        title="账号申请"
        subtitle={`${pending.length} 条待审核`}
      />

      {loading ? (
        <p className="text-center text-ios-gray py-8">加载中...</p>
      ) : applications.length === 0 ? (
        <IOSEmptyState
          icon={<UserPlus className="w-12 h-12" />}
          title="暂无申请"
          description="用户提交申请后会显示在这里"
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <IOSCard key={app.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-lg">{app.name}</p>
                  <p className="text-sm text-ios-gray">{app.email}</p>
                  {app.phone && (
                    <p className="text-sm text-ios-gray">{app.phone}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <IOSBadge color="blue">{roleLabels[app.role]}</IOSBadge>
                  <IOSBadge
                    color={
                      app.status === "PENDING"
                        ? "orange"
                        : app.status === "APPROVED"
                          ? "green"
                          : "gray"
                    }
                  >
                    {statusLabels[app.status]}
                  </IOSBadge>
                </div>
              </div>

              {app.message && (
                <p className="text-sm text-ios-gray mb-2">{app.message}</p>
              )}
              <p className="text-xs text-ios-gray mb-3">
                申请时间：{formatDateTime(app.createdAt)}
              </p>

              {app.status === "PENDING" && approvingId === app.id ? (
                <div className="space-y-3 border-t border-ios-separator pt-3">
                  <IOSInput
                    label="初始密码"
                    type="password"
                    placeholder="至少 6 位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  {app.role === "PARENT" && (
                    <IOSInput
                      label="孩子姓名"
                      placeholder="选填，留空则自动生成"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                    />
                  )}
                  {approveError && (
                    <p className="text-ios-red text-sm text-center">
                      {approveError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <IOSButton
                      size="sm"
                      onClick={() => handleApprove(app)}
                      disabled={processingId === app.id}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      确认开通
                    </IOSButton>
                    <IOSButton
                      size="sm"
                      variant="secondary"
                      onClick={cancelApprove}
                      disabled={processingId === app.id}
                    >
                      取消
                    </IOSButton>
                  </div>
                </div>
              ) : app.status === "PENDING" ? (
                <div className="flex gap-2 border-t border-ios-separator pt-3">
                  <IOSButton
                    size="sm"
                    onClick={() => startApprove(app)}
                    disabled={processingId === app.id}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    通过并开通
                  </IOSButton>
                  <IOSButton
                    size="sm"
                    variant="danger"
                    onClick={() => handleReject(app.id)}
                    disabled={processingId === app.id}
                  >
                    <X className="w-4 h-4 mr-1" />
                    拒绝
                  </IOSButton>
                </div>
              ) : null}
            </IOSCard>
          ))}
        </div>
      )}
    </>
  );
}
