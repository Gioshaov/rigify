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
      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          data-testid="admins-add-btn"
          className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Created
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Last Login
                </th>
                <th className="text-right py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#888888]">
                    No super admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isCurrentUser = admin.id === currentUserId;

                  return (
                    <tr
                      key={admin.id}
                      data-testid={`admin-row-${admin.id}`}
                      className="border-b border-[#222222] hover:bg-[#222222]"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#cccccc] font-medium">{admin.email}</span>
                          {isCurrentUser && (
                            <span className="inline-block text-[10px] text-[#d4a843] bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.3)] px-1.5 py-0.5 rounded uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#888888] text-xs font-mono">
                        {formatTbilisi(admin.created_at, 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-[#888888] text-xs font-mono">
                        {admin.last_sign_in_at
                          ? formatTbilisi(admin.last_sign_in_at, 'MMM d, yyyy HH:mm')
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/audit-logs?resource=admin&admin=${admin.id}`}
                            data-testid={`admin-activity-${admin.id}`}
                            className="text-[#555555] hover:text-[#d4a843] transition-colors"
                            title="View activity"
                            aria-label={`View activity for ${admin.email}`}
                          >
                            <Activity className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRevoke(admin.id, admin.email)}
                            disabled={isCurrentUser || actionInProgress === admin.id || isPending}
                            data-testid={`admin-revoke-${admin.id}`}
                            className="text-[#555555] hover:text-[#ef4444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isCurrentUser ? 'Cannot revoke your own access' : 'Revoke admin access'}
                            aria-label={`Revoke admin access for ${admin.email}`}
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Add Super Admin</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdminEmail('');
                  setAddError('');
                }}
                className="text-[#888888] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label htmlFor="admin-email" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  data-testid="add-admin-email-input"
                  placeholder="admin@example.com"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
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
                  className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress === 'adding' || isPending}
                  data-testid="add-admin-submit-btn"
                  className="flex-1 px-4 py-2 bg-[#d4a843] text-black font-bold rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            data-testid="temp-password-modal"
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Admin Created</h3>
                <p className="text-[#888888] text-sm">{newAdminEmail2}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[#cccccc] text-sm mb-3">
                Temporary password (copy this now, it won&apos;t be shown again):
              </p>
              <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3 flex items-center justify-between">
                <code className="text-[#d4a843] font-mono text-sm break-all">{tempPassword}</code>
                <button
                  onClick={copyPassword}
                  data-testid="temp-password-copy-btn"
                  className="ml-3 text-[#888888] hover:text-[#d4a843] transition-colors flex-shrink-0"
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
              className="w-full px-4 py-2 bg-[#d4a843] text-black font-bold rounded hover:brightness-110 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
