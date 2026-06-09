"use client";

import { useState } from "react";
import Link from "next/link";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  status: "ON SHIFT" | "OFF";
  statusDetail: string;
  email: string;
  added: string;
  photoUrl?: string;
};

const mockStaff: StaffMember[] = [
  {
    id: "1",
    name: "Julian Vance",
    role: "Master Barber",
    status: "ON SHIFT",
    statusDetail: "Until 8:00 PM",
    email: "kuku@gmail.com",
    added: "6/9/2026",
  },
  {
    id: "2",
    name: "Elena Rossi",
    role: "Senior Esthetician",
    status: "OFF",
    statusDetail: "Starts Tomorrow 9:00 AM",
    email: "gara@gmail.com",
    added: "6/9/2026",
  },
  {
    id: "3",
    name: "Marcus Thorne",
    role: "Texture Specialist",
    status: "ON SHIFT",
    statusDetail: "Until 6:00 PM",
    email: "staff5@gmail.com",
    added: "6/3/2026",
  },
  {
    id: "4",
    name: "Sasha Kovic",
    role: "Senior Stylist",
    status: "ON SHIFT",
    statusDetail: "Break at 2:00 PM",
    email: "staff3@gmail.com",
    added: "6/2/2026",
  },
  {
    id: "5",
    name: "Luka Modric",
    role: "Junior Barber",
    status: "OFF",
    statusDetail: "Sick Leave",
    email: "staff6@gmail.com",
    added: "6/1/2026",
  },
];

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState(mockStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExpander, setActiveExpander] = useState<string | null>(null);
  const [profileModalId, setProfileModalId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: string;
    status: string;
  }>({
    name: "",
    role: "Staff",
    status: "Active",
  });

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
    }
  };

  const handleSave = () => {
    if (!activeExpander) return;

    setStaff((prev) =>
      prev.map((member) =>
        member.id === activeExpander
          ? {
              ...member,
              name: editForm.name,
              role: editForm.role,
              status: editForm.status === "Active" ? "ON SHIFT" : ("OFF" as const),
            }
          : member
      )
    );

    console.log("Updated staff member:", {
      id: activeExpander,
      ...editForm,
    });

    setActiveExpander(null);
  };

  const handleCancel = () => {
    setActiveExpander(null);
  };

  // Determine which row the active card is in
  const getRowForCard = (index: number) => Math.floor(index / 3);
  const activeCardIndex = staff.findIndex((s) => s.id === activeExpander);
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
          <Link
            data-testid="add-staff-btn"
            href="/dashboard/staff/invite"
            className="bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs uppercase tracking-widest px-6 py-3 transition-colors"
          >
            + ADD STAFF
          </Link>
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

      {/* Staff Grid */}
      <div className="grid grid-cols-3 gap-6">
        {staff
          .filter(
            (member) =>
              searchQuery === "" ||
              member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              member.role.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((member, index) => {
          const currentRow = getRowForCard(index);
          const isLastInRow = (index + 1) % 3 === 0 || index === staff.length - 1;
          const showExpanderAfter = activeRow === currentRow && isLastInRow;

          return (
            <>
              {/* Staff Card */}
              <div
                key={member.id}
                data-testid={`staff-card-${member.id}`}
                className="bg-zinc-900 border border-zinc-800 overflow-hidden"
              >
                {/* Photo Area with Status Overlay */}
                <div className="relative h-[200px] bg-zinc-800">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
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

                      {/* ROLE */}
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
                          ROLE
                        </label>
                        <select
                          data-testid="staff-edit-role-select"
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, role: e.target.value }))
                          }
                          className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 focus:outline-none text-white text-sm px-3 py-2"
                        >
                          <option value="Staff">Staff</option>
                          <option value="Lead / Manager">Lead / Manager</option>
                        </select>
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
                      className="bg-amber-400 hover:bg-amber-300 text-black text-xs uppercase tracking-widest px-4 py-2 transition-colors"
                    >
                      SAVE CHANGES
                    </button>
                    <button
                      data-testid="staff-edit-cancel-btn"
                      onClick={handleCancel}
                      className="bg-transparent border border-zinc-700 hover:border-zinc-500 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </>
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
          <Link
            data-testid="start-recruitment-link"
            href="/dashboard/staff/invite"
            className="text-amber-400 hover:text-amber-300 uppercase tracking-widest text-xs transition-colors"
          >
            START RECRUITMENT
          </Link>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
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

              {/* Stats Section */}
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-amber-400 uppercase tracking-widest text-[11px] font-bold mb-4">
                  PERFORMANCE
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-800 border border-zinc-700 p-4">
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px]">
                      THIS WEEK
                    </p>
                    <p className="font-mono text-amber-400 text-xl font-bold mt-1">24</p>
                    <p className="text-zinc-400 text-xs mt-1">Appointments</p>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 p-4">
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px]">
                      AVG RATING
                    </p>
                    <p className="font-mono text-amber-400 text-xl font-bold mt-1">4.8</p>
                    <p className="text-zinc-400 text-xs mt-1">Out of 5.0</p>
                  </div>
                  <div className="bg-zinc-800 border border-zinc-700 p-4">
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px]">
                      TOTAL CLIENTS
                    </p>
                    <p className="font-mono text-amber-400 text-xl font-bold mt-1">156</p>
                    <p className="text-zinc-400 text-xs mt-1">All time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800 p-6 flex gap-3">
              <Link
                href={`/dashboard/staff/${selectedProfile.id}/edit`}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-black text-xs uppercase tracking-widest px-4 py-2 text-center transition-colors"
              >
                EDIT PROFILE
              </Link>
              <button
                onClick={() => setProfileModalId(null)}
                className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
