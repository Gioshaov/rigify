"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateStaffMember, deleteStaff } from "./actions";
import { AddArtisanForm } from "@/components/dashboard/staff/AddArtisanForm";
import { Modal } from "@/components/ui/Modal";
import { Portal } from "@/components/ui/Portal";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  status: "ON SHIFT" | "OFF";
  statusDetail: string;
  email: string;
  added: string;
  photoUrl?: string;
  dbRole: string; // Original DB role ('staff' or 'manager')
  isActive: boolean; // Original DB active status
};

type StaffDirectoryClientProps = {
  initialStaff: StaffMember[];
  businessId: string;
};

export function StaffDirectoryClient({ initialStaff, businessId }: StaffDirectoryClientProps) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExpander, setActiveExpander] = useState<string | null>(null);
  const [profileModalId, setProfileModalId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: string;
    status: string;
  }>({
    name: "",
    role: "Staff",
    status: "Active",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync local state when initialStaff changes (e.g., after router.refresh())
  useEffect(() => {
    setStaff(initialStaff);
  }, [initialStaff]);

  const selectedProfile = profileModalId
    ? staff.find((m) => m.id === profileModalId)
    : null;

  const activeStaffMember = activeExpander
    ? staff.find((s) => s.id === activeExpander)
    : null;

  const handleEditSchedule = (member: StaffMember) => {
    if (activeExpander === member.id) {
      setActiveExpander(null);
    } else {
      setActiveExpander(member.id);
      setEditForm({
        name: member.name,
        role: member.role,
        status: member.status === "ON SHIFT" ? "Active" : "Inactive",
      });
      setSaveError(null);
    }
  };

  const handleSave = async () => {
    if (!activeExpander) return;

    setIsSaving(true);
    setSaveError(null);

    const isActive = editForm.status === "Active";

    // Update via server action
    const result = await updateStaffMember({
      staffId: activeExpander,
      name: editForm.name,
      specialty: editForm.role,
      isActive: isActive,
    });

    if (result.success) {
      // Optimistically update local state
      setStaff((prev) =>
        prev.map((member) =>
          member.id === activeExpander
            ? {
                ...member,
                name: editForm.name,
                role: editForm.role,
                status: isActive ? ("ON SHIFT" as const) : ("OFF" as const),
                statusDetail: isActive ? "Active" : "Inactive",
                isActive: isActive,
              }
            : member
        )
      );
      setActiveExpander(null);
    } else {
      setSaveError(result.message || "Failed to save changes");
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setActiveExpander(null);
    setSaveError(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeExpander) return;

    setShowDeleteConfirm(false);
    setIsDeleting(true);
    setSaveError(null);

    const result = await deleteStaff(activeExpander);

    if (result.success) {
      setActiveExpander(null);
      router.refresh();
    } else {
      setSaveError(result.message || "Failed to delete staff member");
      setIsDeleting(false);
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine which row the active card is in (use filteredStaff, not staff)
  const getRowForCard = (index: number) => Math.floor(index / 3);
  const activeCardIndex = filteredStaff.findIndex((s) => s.id === activeExpander);
  const activeRow = activeCardIndex >= 0 ? getRowForCard(activeCardIndex) : -1;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">
          MANAGEMENT
        </div>
        <div className="flex items-start justify-between">
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-white">
            Staff Directory
          </h1>
          <button
            data-testid="add-staff-btn"
            onClick={() => setShowInviteModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs uppercase tracking-widest px-6 py-3 transition-colors"
          >
            + ADD STAFF
          </button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="mb-8 flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-[0_0_65%] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
            search
          </span>
          <input
            data-testid="staff-search-input"
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 pl-12 pr-4 py-3 text-white font-hanken text-sm placeholder:text-zinc-500 focus:border-amber-400 outline-none transition-colors"
          />
        </div>

        {/* Department Dropdown */}
        <div className="flex-[0_0_32%] relative">
          <select
            data-testid="staff-department-select"
            className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white font-hanken text-sm appearance-none cursor-pointer focus:border-amber-400 outline-none transition-colors"
          >
            <option>All Departments</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-zinc-400 pointer-events-none">
            chevron_right
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && staff.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <span className="material-symbols-outlined text-[64px] text-zinc-600 mb-4 block">
            group_off
          </span>
          <h2 className="text-white text-xl font-semibold mb-2">No Staff Members Yet</h2>
          <p className="text-zinc-400 mb-6">Add your first staff member to get started.</p>
          <button
            data-testid="empty-state-add-staff-link"
            onClick={() => setShowInviteModal(true)}
            className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs uppercase tracking-widest px-6 py-3 transition-colors"
          >
            + ADD STAFF
          </button>
        </div>
      )}

      {/* No Search Results */}
      {filteredStaff.length === 0 && staff.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 text-center">
          <span className="material-symbols-outlined text-[64px] text-zinc-600 mb-4 block">
            search_off
          </span>
          <h2 className="text-white text-xl font-semibold mb-2">No Results Found</h2>
          <p className="text-zinc-400">Try a different search term.</p>
        </div>
      )}

      {/* Staff Grid */}
      {filteredStaff.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {filteredStaff.map((member, index) => {
            const currentRow = getRowForCard(index);
            const isLastInRow = (index + 1) % 3 === 0 || index === filteredStaff.length - 1;
            const showExpanderAfter = activeRow === currentRow && isLastInRow;

            return (
              <Fragment key={member.id}>
                {/* Staff Card */}
                <div
                  data-testid={`staff-card-${member.id}`}
                  className="bg-zinc-900 border border-zinc-800 overflow-hidden"
                >
                  {/* Photo Area with Status Overlay */}
                  <div className="relative h-[200px] bg-zinc-800">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[64px] text-zinc-600">
                          person
                        </span>
                      </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-2">
                      <div
                        className={`flex items-center gap-1 text-xs uppercase tracking-widest mb-1 ${
                          member.status === "ON SHIFT" ? "text-green-400" : "text-zinc-400"
                        }`}
                      >
                        <span className="text-[8px]">●</span>
                        {member.status}
                      </div>
                      <div className="text-[10px] text-zinc-400">{member.statusDetail}</div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-white font-medium text-lg mb-1">{member.name}</h3>
                      <p className="text-amber-400 uppercase tracking-widest text-xs">
                        {member.role}
                      </p>
                    </div>

                    <button
                      data-testid={`staff-edit-schedule-btn-${member.id}`}
                      onClick={() => handleEditSchedule(member)}
                      className="border border-amber-400 text-amber-400 hover:bg-amber-400/10 uppercase tracking-widest text-xs w-full py-2 transition-colors"
                    >
                      EDIT
                    </button>

                    <button
                      data-testid={`staff-view-profile-btn-${member.id}`}
                      onClick={() => setProfileModalId(member.id)}
                      className="text-zinc-400 hover:text-white uppercase tracking-widest text-xs w-full py-2 transition-colors"
                    >
                      VIEW PROFILE
                    </button>
                  </div>
                </div>

                {/* Expander Panel (shows after last card in the row) */}
                {showExpanderAfter && activeExpander && (
                  <div className="col-span-3 bg-zinc-900 border-t-2 border-amber-400 px-8 py-6">
                    {saveError && (
                      <div className="mb-4 p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-sm">
                        {saveError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-8">
                      {/* LEFT COLUMN - Editable */}
                      <div className="space-y-4">
                        {/* NAME */}
                        <div>
                          <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                            NAME
                          </label>
                          <input
                            data-testid="staff-edit-name-input"
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:outline-none text-white text-sm px-3 py-2"
                          />
                        </div>

                        {/* ROLE/SPECIALTY */}
                        <div>
                          <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                            SPECIALTY / ROLE
                          </label>
                          <input
                            data-testid="staff-edit-role-input"
                            type="text"
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, role: e.target.value }))
                            }
                            placeholder="e.g., Master Barber, Senior Stylist"
                            className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:outline-none text-white text-sm px-3 py-2"
                          />
                        </div>

                        {/* STATUS */}
                        <div>
                          <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                            STATUS
                          </label>
                          <select
                            data-testid="staff-edit-status-select"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, status: e.target.value }))
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:outline-none text-white text-sm px-3 py-2"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      {/* RIGHT COLUMN - Read Only */}
                      <div className="space-y-4 opacity-60">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
                          READ ONLY
                        </div>

                        {/* EMAIL */}
                        <div>
                          <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                            EMAIL
                          </label>
                          <div className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2">
                            {activeStaffMember?.email}
                          </div>
                        </div>

                        {/* ADDED */}
                        <div>
                          <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                            ADDED
                          </label>
                          <div className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2">
                            {activeStaffMember?.added}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        data-testid="staff-edit-save-btn"
                        onClick={handleSave}
                        disabled={isSaving || isDeleting}
                        className="bg-amber-400 hover:bg-amber-300 text-black text-xs uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                      <button
                        data-testid="staff-edit-cancel-btn"
                        onClick={handleCancel}
                        disabled={isSaving || isDeleting}
                        className="bg-transparent border border-zinc-700 hover:border-zinc-500 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        CANCEL
                      </button>
                      <button
                        data-testid="staff-delete-btn"
                        onClick={handleDeleteClick}
                        disabled={isSaving || isDeleting}
                        className="ml-auto bg-transparent border border-red-900/50 hover:border-red-500 hover:bg-red-900/20 text-red-400 text-xs uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "DELETING..." : "DELETE STAFF"}
                      </button>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}

          {/* Add New Artisan CTA Card */}
          <div
            data-testid="add-artisan-cta-card"
            className="bg-zinc-900 border-2 border-dashed border-zinc-700 overflow-hidden flex flex-col items-center justify-center p-8 text-center"
          >
            <span className="material-symbols-outlined text-[64px] text-zinc-600 mb-4">
              person_add
            </span>
            <h3 className="text-white font-medium text-lg mb-2">Add New Artisan</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-[200px]">
              Expand your studio&apos;s reach with new expert staff.
            </p>
            <button
              data-testid="start-recruitment-link"
              onClick={() => setShowInviteModal(true)}
              className="text-amber-400 hover:text-amber-300 uppercase tracking-widest text-xs transition-colors bg-transparent border-none p-0"
            >
              START RECRUITMENT
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <Portal testId="staff-profile-modal-portal">
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-modal"
          onClick={() => setProfileModalId(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 max-w-2xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-zinc-600">
                    person
                  </span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-2xl">{selectedProfile.name}</h2>
                  <p className="text-amber-400 uppercase tracking-widest text-xs mt-1">
                    {selectedProfile.role}
                  </p>
                </div>
              </div>
              <button
                data-testid="profile-modal-close-btn"
                onClick={() => setProfileModalId(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedProfile.status === "ON SHIFT" ? "bg-green-400 animate-pulse" : "bg-zinc-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-bold uppercase tracking-widest ${
                      selectedProfile.status === "ON SHIFT" ? "text-green-400" : "text-zinc-400"
                    }`}
                  >
                    {selectedProfile.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{selectedProfile.statusDetail}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-400">
                      mail
                    </span>
                    <p className="text-white text-sm">{selectedProfile.email}</p>
                  </div>
                </div>

                {/* Date Added */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Date Added
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-400">
                      event
                    </span>
                    <p className="text-white text-sm">{selectedProfile.added}</p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Position
                  </label>
                  <p className="text-white text-sm">{selectedProfile.role}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    Current Status
                  </label>
                  <p className="text-white text-sm">
                    {selectedProfile.status === "ON SHIFT" ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800 p-6 flex gap-3">
              <button
                data-testid="profile-modal-close-footer-btn"
                onClick={() => setProfileModalId(null)}
                className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Invite Staff Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        closeButtonTestId="invite-modal-close-btn"
      >
        <AddArtisanForm onClose={() => setShowInviteModal(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        closeButtonTestId="delete-confirm-modal-close-btn"
      >
        <div className="bg-zinc-900 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-400 text-[32px]">
              warning
            </span>
            <h2 className="text-white font-bold text-xl">Delete Staff Member?</h2>
          </div>
          <p className="text-zinc-300 mb-6">
            Are you sure you want to delete {activeStaffMember?.name}? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              data-testid="delete-confirm-btn"
              onClick={handleDeleteConfirm}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs uppercase tracking-widest px-4 py-3 transition-colors"
            >
              Delete
            </button>
            <button
              data-testid="delete-cancel-btn"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white text-xs uppercase tracking-widest px-4 py-3 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
