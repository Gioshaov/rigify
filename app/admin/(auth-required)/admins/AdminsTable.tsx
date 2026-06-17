'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatTbilisi } from '@/lib/utils/datetime';
import { createSuperAdmin, revokeSuperAdmin } from './actions';
import { Shield, UserMinus, Activity, Plus, X, Copy, Check } from 'lucide-react';
import Link from 'next/link';

type Admin = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

interface AdminsTableProps {
  admins: Admin[];
  currentUserId: string;
}

export function AdminsTable({ admins, currentUserId }: AdminsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Add Admin Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addError, setAddError] = useState('');

  // Success Modal (shows temp password)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newAdminEmail2, setNewAdminEmail2] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setAddError('Please enter a valid email address');
      return;
    }

    setActionInProgress('adding');
    startTransition(async () => {
      const result = await createSuperAdmin(newAdminEmail);
      setActionInProgress(null);

      if (result.error) {
        setAddError(result.error);
      } else if (result.tempPassword) {
        setTempPassword(result.tempPassword);
        setNewAdminEmail2(newAdminEmail);
        setNewAdminEmail('');
        setShowAddModal(false);
        setShowSuccessModal(true);
        setPasswordCopied(false);
        router.refresh();
      }
    });
  };

  const handleRevoke = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Revoke admin access for ${adminEmail}? They will no longer be able to access the admin panel.`)) {
      return;
    }

    setActionInProgress(adminId);
    startTransition(async () => {
      const result = await revokeSuperAdmin(adminId, adminEmail);
      setActionInProgress(null);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  return (
    <>
      {/* Add Admin Button */}
      <div className="mb-6 px-8">
        <button
          onClick={() => setShowAddModal(true)}
          data-testid="admins-add-btn"
          className="h-9 px-6 border border-[#d4a843] text-[#d4a843] font-mono text-xs uppercase tracking-wider rounded-none hover:bg-[#d4a843] hover:text-black transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Column Headers */}
      <div className="px-8 py-3 border-b border-[rgba(255,255,255,0.06)] grid grid-cols-[3fr_1.5fr_2fr_120px] gap-4">
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Email
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Created
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Last Login
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider text-right">
          Actions
        </div>
      </div>

      {/* Admin Rows */}
      <div>
        {admins.length === 0 ? (
          <div className="px-8 py-12 text-center text-[#6b6880] font-mono text-sm">
            No super admins found
          </div>
        ) : (
          admins.map((admin) => {
            const isCurrentUser = admin.id === currentUserId;

            return (
              <div
                key={admin.id}
                data-testid={`admin-row-${admin.id}`}
                className="relative px-8 py-4 bg-[#111111] border-b border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a] hover:border-l-[1px] hover:border-l-[#d4a843] transition-all grid grid-cols-[3fr_1.5fr_2fr_120px] gap-4 items-center min-h-[64px]"
              >
                {/* Email */}
                <div className="flex items-center gap-2">
                  <span className="text-white text-[15px] font-medium">{admin.email}</span>
                  {isCurrentUser && (
                    <span className="inline-block text-[10px] text-[#d4a843] bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.3)] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      You
                    </span>
                  )}
                </div>

                {/* Created */}
                <div className="text-[#6b6880] font-mono text-[11px]">
                  {formatTbilisi(admin.created_at, 'MMM d, yyyy')}
                </div>

                {/* Last Login */}
                <div className="text-[#6b6880] font-mono text-[11px]">
                  {admin.last_sign_in_at ? formatTbilisi(admin.last_sign_in_at, 'MMM d, yyyy HH:mm') : '—'}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/audit-logs?resource=admin&admin=${admin.id}`}
                    data-testid={`admin-activity-${admin.id}`}
                    className="w-7 h-7 flex items-center justify-center text-[#6b6880] hover:text-[#d4a843] transition-colors"
                    title="View activity"
                    aria-label={`View activity for ${admin.email}`}
                  >
                    <Activity className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleRevoke(admin.id, admin.email)}
                    disabled={isCurrentUser || actionInProgress === admin.id || isPending}
                    data-testid={`admin-revoke-${admin.id}`}
                    className="w-7 h-7 flex items-center justify-center text-[#6b6880] hover:text-[#ef4444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isCurrentUser ? 'Cannot revoke your own access' : 'Revoke admin access'}
                    aria-label={`Revoke admin access for ${admin.email}`}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.15)] rounded p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Add Super Admin</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminEmail('');
                  setAddError('');
                }}
                data-testid="add-admin-close-btn"
                className="text-[#6b6880] hover:text-white transition-colors"
                aria-label="Close add admin modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label htmlFor="admin-email" className="block text-[#6b6880] font-mono text-[11px] mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  data-testid="add-admin-email-input"
                  placeholder="admin@example.com"
                  className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] rounded-none px-4 text-white font-mono text-xs focus:outline-none focus:border-[#d4a843] placeholder:text-[#6b6880]"
                  required
                  autoFocus
                />
              </div>

              {addError && (
                <div className="mb-4 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded text-[#ef4444] text-sm">
                  {addError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewAdminEmail('');
                    setAddError('');
                  }}
                  data-testid="add-admin-cancel-btn"
                  className="flex-1 h-9 px-4 border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none hover:border-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress === 'adding' || isPending}
                  data-testid="add-admin-submit-btn"
                  className="flex-1 h-9 px-4 border border-[#d4a843] bg-[#d4a843] text-black font-mono text-xs uppercase tracking-wider rounded-none hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionInProgress === 'adding' ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal (Temp Password) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            data-testid="temp-password-modal"
            className="bg-[#111111] border border-[rgba(255,255,255,0.15)] rounded p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Admin Created</h3>
                <p className="text-[#6b6880] text-sm">{newAdminEmail2}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-white text-sm mb-3">
                Temporary password (copy this now, it won&apos;t be shown again):
              </p>
              <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] rounded-none p-3 flex items-center justify-between">
                <code className="text-[#d4a843] font-mono text-sm break-all">{tempPassword}</code>
                <button
                  onClick={copyPassword}
                  data-testid="temp-password-copy-btn"
                  className="ml-3 text-[#6b6880] hover:text-[#d4a843] transition-colors flex-shrink-0"
                  title="Copy password"
                >
                  {passwordCopied ? (
                    <Check className="w-4 h-4 text-[#22c55e]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordCopied && (
                <p className="text-[#22c55e] text-xs mt-2">Copied to clipboard!</p>
              )}
            </div>

            <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded p-3 mb-4">
              <p className="text-[#f59e0b] text-xs">
                ⚠️ The new admin should change their password after first login. This temporary password will not be shown again.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              data-testid="temp-password-done-btn"
              className="w-full h-9 px-4 border border-[#d4a843] bg-[#d4a843] text-black font-mono text-xs uppercase tracking-wider rounded-none hover:brightness-110 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
