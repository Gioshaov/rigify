"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Building2,
  Users,
  Tag,
  Image as ImageIcon,
  Settings,
  Menu,
  Bell,
  Search,
  Pencil,
  EyeOff,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Mock data
const MOCK_BUSINESSES = [
  {
    id: "1",
    slug: "mitte-beauty-salon",
    name: "Mitte Beauty Salon",
    category: "BEAUTY SALON",
    city: "Tbilisi",
    status: "ACTIVE" as const,
    dateAdded: "2023.11.12",
    isActive: true,
  },
  {
    id: "2",
    slug: "studio-nino",
    name: "Studio Nino",
    category: "BEAUTY SALON",
    city: "Tbilisi",
    status: "ACTIVE" as const,
    dateAdded: "2023.11.08",
    isActive: true,
  },
  {
    id: "3",
    slug: "lumi-wellness",
    name: "Lumi Wellness",
    category: "WELLNESS",
    city: "Batumi",
    status: "INACTIVE" as const,
    dateAdded: "2023.10.24",
    isActive: false,
  },
  {
    id: "4",
    slug: "onyx-artistry",
    name: "Onyx Artistry",
    category: "ESTHETICS",
    city: "Tbilisi",
    status: "ACTIVE" as const,
    dateAdded: "2023.10.15",
    isActive: true,
  },
  {
    id: "5",
    slug: "salis-spa",
    name: "Sali's Spa",
    category: "WELLNESS",
    city: "Kutaisi",
    status: "ACTIVE" as const,
    dateAdded: "2023.10.02",
    isActive: true,
  },
];

const MOCK_STAFF = [
  { id: "1", initials: "UC", name: "Ucha", role: "HAIR STYLIST" },
  { id: "2", initials: "MA", name: "Mariam", role: "HAIR STYLIST" },
  { id: "3", initials: "SA", name: "Sali", role: "NAIL SPECIALIST" },
  { id: "4", initials: "AN", name: "Annamaria", role: "NAIL SPECIALIST" },
];

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Dashboard", id: "dashboard" },
  { icon: Building2, label: "Businesses", id: "businesses", active: true },
  { icon: Users, label: "Staff", id: "staff" },
  { icon: Tag, label: "Categories", id: "categories" },
  { icon: ImageIcon, label: "Media", id: "media" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export default function SuperAdminPanel() {
  const [activeNav, setActiveNav] = useState("businesses");
  const [selectedBusiness, setSelectedBusiness] = useState("mitte-beauty-salon");

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#111111] flex-shrink-0">
        {/* Logo */}
        <div className="pt-8 pb-8 px-5">
          <h1 className="text-[#d4a843] text-xl font-bold uppercase tracking-widest">
            RIGIFY
          </h1>
          <p className="text-[#888888] text-[11px] uppercase tracking-widest mt-1">
            SUPER ADMIN
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => setActiveNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors
                  ${
                    isActive
                      ? "bg-[#1a1a1a] text-white border-l-2 border-[#d4a843]"
                      : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* TOP BAR */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 pr-6">
          <div className="flex items-center gap-4">
            <Menu className="w-[18px] h-[18px] text-[#888888]" />
            <h2 className="text-xl font-bold text-white">Businesses</h2>
          </div>

          <div className="flex items-center gap-4">
            <button data-testid="notifications-btn" className="text-[#888888] hover:text-white transition-colors">
              <Bell className="w-[18px] h-[18px]" />
            </button>
            <button data-testid="menu-btn" className="w-5 h-5 bg-[#2a2a2a] rounded"></button>
            <button
              data-testid="new-entry-btn"
              className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:brightness-110 transition-all"
            >
              NEW ENTRY
            </button>
          </div>
        </header>

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-4 mt-6 px-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              TOTAL BUSINESSES
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              24
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              ACTIVE UNITS
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              21
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              OPERATING CITIES
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              03
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-5">
            <p className="text-[#888888] text-[11px] uppercase tracking-widest">
              CATEGORIES
            </p>
            <p className="text-[#d4a843] text-5xl font-bold font-mono mt-2 leading-none">
              08
            </p>
          </div>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className="flex items-center gap-3 mt-6 px-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
            <input
              type="text"
              data-testid="search-input"
              placeholder="Search businesses, IDs, or owners..."
              className="w-full h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded pl-10 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:ring-1 focus:ring-[#d4a843]"
            />
          </div>
          <button
            data-testid="filter-categories-btn"
            className="h-10 px-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#cccccc] text-[11px] uppercase tracking-wider hover:border-[#3a3a3a] transition-colors"
          >
            ALL CATEGORIES ▾
          </button>
          <button
            data-testid="filter-cities-btn"
            className="h-10 px-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#cccccc] text-[11px] uppercase tracking-wider hover:border-[#3a3a3a] transition-colors"
          >
            ALL CITIES ▾
          </button>
          <span className="text-[#888888] text-xs tracking-wider">
            24 BUSINESSES
          </span>
        </div>

        {/* BUSINESSES TABLE */}
        <div className="mt-4 px-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded">
            {/* Table Header */}
            <div className="flex items-center border-b border-[#2a2a2a] px-5 py-3">
              <div className="flex-1 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                BUSINESS NAME
              </div>
              <div className="w-[140px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                CATEGORY
              </div>
              <div className="w-[100px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                CITY
              </div>
              <div className="w-[100px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                STATUS
              </div>
              <div className="w-[140px] text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                DATE ADDED
              </div>
              <div className="w-[100px] text-[#888888] text-[11px] uppercase tracking-widest font-medium text-right">
                ACTIONS
              </div>
            </div>

            {/* Table Rows */}
            {MOCK_BUSINESSES.map((business) => (
              <div
                key={business.id}
                data-testid={`business-row-${business.slug}`}
                onClick={() => setSelectedBusiness(business.slug)}
                className={`
                  flex items-center border-b border-[#222222] px-5 h-16 transition-colors cursor-pointer
                  ${selectedBusiness === business.slug ? "bg-[#1a1a1a]" : "hover:bg-[#222222]"}
                `}
              >
                {/* Business Name */}
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-sm ${
                      business.isActive ? "bg-[#d4a843]" : "bg-[#555555]"
                    }`}
                  ></div>
                  <span className="text-white font-medium text-sm">
                    {business.name}
                  </span>
                </div>

                {/* Category */}
                <div className="w-[140px]">
                  <span className="inline-block bg-[#222222] border border-[#333333] text-[#aaaaaa] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                    {business.category}
                  </span>
                </div>

                {/* City */}
                <div className="w-[100px] text-[#cccccc] text-sm">
                  {business.city}
                </div>

                {/* Status */}
                <div className="w-[100px]">
                  {business.status === "ACTIVE" ? (
                    <span className="inline-block bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-block bg-[rgba(100,100,100,0.1)] border border-[#444444] text-[#888888] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                      INACTIVE
                    </span>
                  )}
                </div>

                {/* Date Added */}
                <div className="w-[140px] text-[#888888] text-[13px] font-mono">
                  {business.dateAdded}
                </div>

                {/* Actions */}
                <div className="w-[100px] flex items-center justify-end gap-4">
                  <button
                    data-testid={`edit-btn-${business.slug}`}
                    className="text-[#555555] hover:text-[#d4a843] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Edit", business.slug);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    data-testid={`view-btn-${business.slug}`}
                    className="text-[#555555] hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("View", business.slug);
                    }}
                  >
                    {business.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    data-testid={`delete-btn-${business.slug}`}
                    className="text-[#555555] hover:text-[#ef4444] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Delete", business.slug);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-8 pt-4">
          <p className="text-[#888888] text-xs tracking-wider">
            Showing 1 to 8 of 24
          </p>
          <div className="flex items-center gap-2">
            <button
              data-testid="pagination-prev"
              className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#888888] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              data-testid="pagination-1"
              className="w-8 h-8 flex items-center justify-center bg-[#d4a843] text-black font-bold text-[13px] rounded"
            >
              1
            </button>
            <button
              data-testid="pagination-2"
              className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#888888] hover:text-white transition-colors text-[13px]"
            >
              2
            </button>
            <button
              data-testid="pagination-3"
              className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#888888] hover:text-white transition-colors text-[13px]"
            >
              3
            </button>
            <button
              data-testid="pagination-next"
              className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#888888] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STAFF SECTION */}
        <div className="mt-8 px-8 pb-8">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-base">
              Staff{" "}
              <span className="text-[#888888] font-normal">
                — Mitte Beauty Salon
              </span>
            </h3>
            <button
              data-testid="add-staff-btn"
              className="border border-[#d4a843] text-[#d4a843] bg-transparent uppercase text-[11px] tracking-wider px-4 py-2 rounded hover:bg-[#d4a843] hover:text-black transition-colors"
            >
              + Add Staff Member
            </button>
          </div>

          {/* Staff Cards */}
          <div className="flex flex-wrap gap-4 mt-4">
            {MOCK_STAFF.map((staff) => (
              <div
                key={staff.id}
                data-testid={`staff-card-${staff.name.toLowerCase()}`}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4 w-[200px]"
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-[#2a2a2a] border border-[#3a3a3a] rounded-full flex items-center justify-center">
                  <span className="text-[#d4a843] font-bold text-sm font-mono">
                    {staff.initials}
                  </span>
                </div>

                {/* Name & Role */}
                <p className="text-white font-semibold text-sm mt-3">
                  {staff.name}
                </p>
                <p className="text-[#888888] text-xs uppercase tracking-wider mt-0.5">
                  {staff.role}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    data-testid={`edit-staff-${staff.name.toLowerCase()}`}
                    className="text-[#555555] hover:text-[#d4a843] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    data-testid={`delete-staff-${staff.name.toLowerCase()}`}
                    className="text-[#555555] hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
