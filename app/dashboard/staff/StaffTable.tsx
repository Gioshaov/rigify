"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateStaff, deleteStaff } from "./actions";

type StaffMember = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string; is_active: boolean } | null>(null);

  // Warn about unsaved changes when editing
  useEffect(() => {
    if (!editingId) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editingId]);

  function startEditing(member: StaffMember) {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      email: member.email || "",
      role: member.role,
      is_active: member.is_active,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
    setResult(null);
  }

  async function saveEditing(staffId: string) {
    if (!editForm) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("role", editForm.role);
    formData.append("is_active", editForm.is_active ? "on" : "");

    const response = await updateStaff(staffId, formData);

    setLoading(false);
    setResult(response);

    if (response.success) {
      setTimeout(() => {
        setEditingId(null);
        setEditForm(null);
        setResult(null);
        router.refresh();
      }, 1000);
    }
  }

  async function handleDelete(staffId: string, staffName: string) {
    if (!confirm(`Remove ${staffName} from your team?`)) {
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await deleteStaff(staffId);

    setLoading(false);
    setResult(response);

    if (response.success) {
      setTimeout(() => router.refresh(), 1000);
    }
  }

  return (
    <div>
      {/* Result Message */}
      {result && (
        <div
          className={`mb-6 p-4 border ${
            result.success
              ? "border-primary/20 bg-primary/10"
              : "border-error/20 bg-error/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[20px] ${result.success ? "text-primary" : "text-error"}`}>
              {result.success ? "check_circle" : "error"}
            </span>
            <p className={`font-hanken text-[14px] leading-[1.5] font-normal ${result.success ? "text-primary" : "text-error"}`}>
              {result.message}
            </p>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-surface-container border border-white/5">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-surface-container-low">
          <div className="col-span-2">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Name
            </span>
          </div>
          <div className="col-span-3">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Email
            </span>
          </div>
          <div className="col-span-2">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Role
            </span>
          </div>
          <div className="col-span-1">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Status
            </span>
          </div>
          <div className="col-span-2">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Added
            </span>
          </div>
          <div className="col-span-2">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-text-secondary uppercase">
              Actions
            </span>
          </div>
        </div>

        {/* Table Rows */}
        <div>
          {staff.map((member, index) => {
            const isEditing = editingId === member.id;

            return (
              <div
                key={member.id}
                data-testid={`staff-row-${member.id}`}
                className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors ${
                  isEditing ? "bg-surface-container-highest" : "hover:bg-surface-container-low"
                } ${index !== staff.length - 1 ? "border-b border-white/5" : ""}`}
              >
                {/* Name Column - Editable */}
                <div className="col-span-2 flex items-center gap-2">
                  {isEditing && editForm ? (
                    <input
                      data-testid={`edit-name-input-${member.id}`}
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-background border border-white/10 focus:border-primary text-on-surface outline-none transition-all disabled:opacity-50 font-hanken text-[14px]"
                    />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                      <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface truncate">
                        {member.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Email Column - Read Only */}
                <div className="col-span-3 flex items-center gap-2">
                  {member.email ? (
                    <>
                      <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                      <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary truncate">
                        {member.email}
                      </span>
                    </>
                  ) : (
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary/50 italic">
                      No email
                    </span>
                  )}
                </div>

                {/* Role Column - Editable */}
                <div className="col-span-2 flex items-center">
                  {isEditing && editForm ? (
                    <select
                      data-testid={`edit-role-select-${member.id}`}
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-background border border-white/10 focus:border-primary text-on-surface outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer font-hanken text-[14px]"
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                    </select>
                  ) : (
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary capitalize">
                      {member.role}
                    </span>
                  )}
                </div>

                {/* Status Column - Editable */}
                <div className="col-span-1 flex items-center">
                  {isEditing && editForm ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        data-testid={`edit-active-checkbox-${member.id}`}
                        type="checkbox"
                        checked={editForm.is_active}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                        disabled={loading}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface uppercase">
                        {editForm.is_active ? "Active" : "Inactive"}
                      </span>
                    </label>
                  ) : (
                    <span
                      className={`px-2 py-1 border font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase ${
                        member.is_active
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-surface-container border-white/5 text-text-secondary"
                      }`}
                    >
                      {member.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>

                {/* Added Column - Read Only */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-text-secondary text-[16px]">
                    calendar_today
                  </span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-text-secondary">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions Column */}
                <div className="col-span-2 flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        data-testid={`save-btn-${member.id}`}
                        onClick={() => saveEditing(member.id)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-2 bg-primary text-background font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase hover:bg-primary-fixed transition-all disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        {loading ? "Saving" : "Save"}
                      </button>
                      <button
                        data-testid={`cancel-btn-${member.id}`}
                        onClick={cancelEditing}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-2 border border-white/10 text-on-surface font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase hover:bg-surface-container-low transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        data-testid={`delete-btn-${member.id}`}
                        onClick={() => handleDelete(member.id, member.name)}
                        disabled={loading}
                        className="flex items-center gap-1 px-2 py-2 text-error hover:text-error/80 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </>
                  ) : (
                    <button
                      data-testid={`edit-btn-${member.id}`}
                      onClick={() => startEditing(member)}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase">
                        Edit
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
