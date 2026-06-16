'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Lock,
  Upload,
  ImageIcon,
  ExternalLink,
  Copy,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

export default function EditBusinessPage({
  params,
}: {
  params: { id: string };
}) {
  // TODO: Verify super_admin session and fetch business by params.id via createAdminClient()
  // Mock data - hardcoded
  const business = {
    name: 'Mitte Beauty Salon',
    subdomain: 'mitte',
    status: 'Active',
    slug: 'mitte-beauty-salon',
    description:
      'Luxury wellness and beauty studio located in the heart of Vake, offering premium hair care, aesthetic treatments, and professional makeup services.',
    categories: ['BEAUTY SALON', 'SPA & WELLNESS'],
    city: 'Tbilisi',
    district: 'Vake',
    streetAddress: 'ა. პოლიტკოვსკაიას ქუჩა 37',
    latitude: '41.7101',
    longitude: '44.7505',
    phone: '+995 322 123 456',
    email: 'hello@mitte.ge',
    instagram: '@mitte_beauty',
    openingSchedule: 'mon-fri-9-20',
    lastUpdated: '2023-10-24 14:32:01 UTC',
  };

  const staff = [
    { id: '1', name: 'Ucha K.', role: 'Stylist', avatar: 'UK', avatarClass: 'bg-[#1c1608] text-[#d4a843]' },
    { id: '2', name: 'Mariam B.', role: 'Colorist', avatar: 'MB', avatarClass: 'bg-[#081408] text-[#22c55e]' },
    { id: '3', name: 'Sali N.', role: 'Aesthetician', avatar: 'SN', avatarClass: 'bg-[#120814] text-[#a855f7]' },
    { id: '4', name: 'Annamaria G.', role: 'Manager', avatar: 'AG', avatarClass: 'bg-[#160a08] text-[#f97316]' },
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] text-[#22c55e] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="bg-[rgba(100,100,100,0.1)] border border-[rgba(100,100,100,0.25)] text-[#888888] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-10 pt-8 pb-20">
      {/* Top of page */}
      <Link
        href="/admin"
        data-testid="back-to-businesses"
        className="inline-block text-[#d4a843] text-[11px] font-medium uppercase tracking-widest hover:underline"
      >
        ← BACK TO BUSINESSES
      </Link>

      <h1 className="text-white text-[30px] font-bold tracking-tight mt-4">
        Edit Business
      </h1>

      <p className="text-[#444444] text-[11px] uppercase tracking-widest font-mono mt-1">
        LAST UPDATED: {business.lastUpdated}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-[#1e1e1e] mt-6 mb-7"></div>

      {/* Two-column layout */}
      <div className="flex gap-8 items-start">
        {/* Left column - Form */}
        <div className="flex-1 min-w-0">
          {/* SECTION 1: BASIC INFORMATION */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#d4a843] text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                BASIC INFORMATION
              </span>
              <div className="flex-1 h-px bg-[#1e1e1e]"></div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Row 1: Business Name + Subdomain */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="business-name" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    BUSINESS NAME <span className="text-[#d4a843] ml-0.5">*</span>
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    defaultValue={business.name}
                    data-testid="input-business-name"
                    className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                  />
                </div>
                <div>
                  <label htmlFor="subdomain" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    SUBDOMAIN <span className="text-[#d4a843] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="subdomain"
                      type="text"
                      defaultValue={business.subdomain}
                      data-testid="input-subdomain"
                      className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 pr-20 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a3a] text-[13px] font-mono pointer-events-none">
                      .rigify.ge
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Status + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    STATUS <span className="text-[#d4a843] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="status"
                      defaultValue={business.status}
                      data-testid="select-status"
                      className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444444] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="slug" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    SLUG (SYSTEM)
                  </label>
                  <div className="relative">
                    <input
                      id="slug"
                      type="text"
                      defaultValue={business.slug}
                      disabled
                      data-testid="input-slug"
                      className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded text-[#444444] text-[13px] font-mono h-[42px] px-3 pr-10 cursor-not-allowed"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#2a2a2a]" />
                  </div>
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label htmlFor="description" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                  DESCRIPTION
                </label>
                <textarea
                  id="description"
                  defaultValue={business.description}
                  data-testid="textarea-description"
                  className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[88px] px-3 py-2.5 resize-none focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                />
              </div>

              {/* Row 4: Categories */}
              <div>
                <div className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                  CATEGORIES <span className="text-[#d4a843] ml-0.5">*</span>
                </div>
                <div
                  data-testid="categories-container"
                  className="bg-[#141414] border border-[#252525] rounded min-h-[42px] px-2.5 py-2 flex flex-wrap gap-2 items-center"
                >
                  {business.categories.map((category) => (
                    <span
                      key={category}
                      data-testid={`pill-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1 bg-transparent border border-[#d4a843] text-[#d4a843] text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm"
                    >
                      {category}
                      <button
                        type="button"
                        data-testid={`remove-category-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-[#d4a843] opacity-60 hover:opacity-100 text-xs"
                        aria-label={`Remove ${category}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    data-testid="add-category-btn"
                    className="text-[#333333] text-[11px] uppercase tracking-wider hover:text-[#666666] px-1.5 py-0.5"
                  >
                    + ADD CATEGORY
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#d4a843] text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                LOCATION
              </span>
              <div className="flex-1 h-px bg-[#1e1e1e]"></div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Row 1: City + District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    CITY <span className="text-[#d4a843] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      defaultValue={business.city}
                      data-testid="select-city"
                      className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] appearance-none"
                    >
                      <option value="Tbilisi">Tbilisi</option>
                      <option value="Batumi">Batumi</option>
                      <option value="Kutaisi">Kutaisi</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444444] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="district" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    DISTRICT
                  </label>
                  <input
                    id="district"
                    type="text"
                    defaultValue={business.district}
                    data-testid="input-district"
                    className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                  />
                </div>
              </div>

              {/* Row 2: Street Address */}
              <div>
                <label htmlFor="address" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                  STREET ADDRESS (GEORGIAN) <span className="text-[#d4a843] ml-0.5">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  defaultValue={business.streetAddress}
                  data-testid="input-address"
                  className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                />
              </div>

              {/* Row 3: Latitude + Longitude */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    LATITUDE
                  </label>
                  <input
                    id="latitude"
                    type="text"
                    defaultValue={business.latitude}
                    data-testid="input-latitude"
                    className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 font-mono focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    LONGITUDE
                  </label>
                  <input
                    id="longitude"
                    type="text"
                    defaultValue={business.longitude}
                    data-testid="input-longitude"
                    className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 font-mono focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACT & HOURS */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#d4a843] text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                CONTACT &amp; HOURS
              </span>
              <div className="flex-1 h-px bg-[#1e1e1e]"></div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left: Contact */}
              <div className="flex flex-col gap-4">
                <div className="text-[#555555] text-[10px] uppercase tracking-widest mb-0.5">
                  CONTACT
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    PHONE <span className="text-[#d4a843] ml-0.5">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    defaultValue={business.phone}
                    data-testid="input-phone"
                    className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    EMAIL
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      defaultValue={business.email}
                      data-testid="input-email"
                      className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 pr-10 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                    />
                    <button
                      type="button"
                      data-testid="btn-regenerate-email"
                      aria-label="Regenerate email"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <RefreshCw className="w-[13px] h-[13px] text-[#333333] hover:text-[#d4a843] cursor-pointer" />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    INSTAGRAM
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    defaultValue={business.instagram}
                    data-testid="input-instagram"
                    className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] placeholder:text-[#3a3a3a]"
                  />
                </div>
              </div>

              {/* Right: Hours */}
              <div className="flex flex-col gap-4">
                <div className="text-[#555555] text-[10px] uppercase tracking-widest mb-0.5">
                  HOURS
                </div>

                <div>
                  <label htmlFor="hours" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                    OPENING SCHEDULE
                  </label>
                  <div className="relative">
                    <select
                      id="hours"
                      defaultValue={business.openingSchedule}
                      data-testid="select-hours"
                      className="w-full bg-[#141414] border border-[#252525] rounded text-white text-sm h-[42px] px-3 focus:outline-none focus:border-[#d4a843] appearance-none"
                    >
                      <option value="mon-fri-9-18">Mon-Fri: 09:00-18:00, Weekends: Closed</option>
                      <option value="mon-fri-9-20">Mon-Fri: 09:00-20:00, Sat: 10:00-18:00, Sun: Closed</option>
                      <option value="mon-sat-9-20">Mon-Sat: 09:00-20:00, Sun: Closed</option>
                      <option value="mon-sun-9-21">Mon-Sun: 09:00-21:00</option>
                      <option value="mon-sun-10-22">Mon-Sun: 10:00-22:00</option>
                      <option value="24-7">24/7 Open</option>
                      <option value="custom">Custom Schedule</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444444] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: BRAND ASSETS */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[#d4a843] text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                BRAND ASSETS
              </span>
              <div className="flex-1 h-px bg-[#1e1e1e]"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cover-image" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                  COVER IMAGE (16:9)
                </label>
                <label
                  htmlFor="cover-image"
                  data-testid="upload-cover"
                  className="bg-[#0f0f0f] border-2 border-dashed border-[#1e1e1e] rounded h-[110px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#2a2a2a] hover:bg-[#111111] transition-colors"
                >
                  <Upload className="w-[18px] h-[18px] text-[#2a2a2a]" />
                  <span className="text-[#2a2a2a] text-[11px] uppercase tracking-wider">
                    CLICK TO UPLOAD
                  </span>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
              </div>

              <div>
                <label htmlFor="logo-image" className="block text-[#666666] text-[11px] uppercase tracking-widest mb-1.5">
                  BRAND LOGO (1:1)
                </label>
                <label
                  htmlFor="logo-image"
                  data-testid="upload-logo"
                  className="bg-[#0f0f0f] border-2 border-dashed border-[#1e1e1e] rounded h-[110px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#2a2a2a] hover:bg-[#111111] transition-colors"
                >
                  <ImageIcon className="w-[18px] h-[18px] text-[#2a2a2a]" />
                  <span className="text-[#2a2a2a] text-[11px] uppercase tracking-wider">
                    CLICK TO UPLOAD
                  </span>
                  <input
                    id="logo-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-10 pt-6 border-t border-[#1e1e1e] flex items-center gap-3">
            <button
              type="button"
              data-testid="btn-save"
              className="bg-[#d4a843] text-black text-[11px] font-bold uppercase tracking-widest px-7 py-[11px] rounded hover:brightness-110 transition-all"
            >
              SAVE CHANGES
            </button>
            <button
              type="button"
              data-testid="btn-cancel"
              className="bg-transparent border border-[#252525] text-[#555555] text-[11px] uppercase tracking-widest px-5 py-[11px] rounded hover:border-[#444444] hover:text-[#888888] transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>

        {/* Right column - Panels */}
        <div className="w-[300px] flex-shrink-0 sticky top-8 flex flex-col gap-4">
          {/* PANEL 1: LIVE STATUS */}
          <div className="bg-[#111111] border border-[#1e1e1e] rounded p-4">
            <div className="flex justify-between items-center">
              <span className="text-[#555555] text-[10px] uppercase tracking-widest">
                LIVE STATUS
              </span>
              {getStatusBadge(business.status)}
            </div>

            <h3 className="text-white text-base font-semibold mt-2.5">
              {business.name}
            </h3>
            <p className="text-[#444444] text-xs font-mono mt-0.5">
              {business.subdomain}.rigify.ge
            </p>

            <div className="flex flex-col gap-2 mt-3.5">
              <button
                type="button"
                data-testid="btn-view-public"
                className="w-full bg-[#181818] border border-[#222222] rounded px-3 py-2 flex justify-between items-center hover:border-[#2a2a2a] hover:bg-[#1e1e1e] transition-colors"
              >
                <span className="text-white text-xs uppercase tracking-wider">
                  VIEW PUBLIC PAGE
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#333333]" />
              </button>

              <button
                type="button"
                data-testid="btn-copy-url"
                className="w-full bg-[#181818] border border-[#222222] rounded px-3 py-2 flex justify-between items-center hover:border-[#2a2a2a] hover:bg-[#1e1e1e] transition-colors"
              >
                <span className="text-white text-xs uppercase tracking-wider">
                  COPY URL
                </span>
                <Copy className="w-3.5 h-3.5 text-[#333333]" />
              </button>
            </div>
          </div>

          {/* PANEL 2: STAFF MEMBERS */}
          <div className="bg-[#111111] border border-[#1e1e1e] rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1">
                <span className="text-[#555555] text-[10px] uppercase tracking-widest">
                  STAFF MEMBERS
                </span>
                <span className="text-[#333333] text-[10px]">({staff.length})</span>
              </div>
              <button
                type="button"
                data-testid="staff-add-btn"
                aria-label="Add staff member"
              >
                <UserPlus className="w-[15px] h-[15px] text-[#333333] cursor-pointer hover:text-[#d4a843]" />
              </button>
            </div>

            {staff.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 py-2 ${
                  index < staff.length - 1 ? 'border-b border-[#181818]' : ''
                }`}
              >
                <div
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold font-mono flex-shrink-0 ${member.avatarClass}`}
                >
                  {member.avatar}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="text-white text-[13px] font-medium">
                    {member.name}
                  </div>
                  <div className="text-[#444444] text-[10px] uppercase tracking-wider mt-0.5">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PANEL 3: DANGER ZONE */}
          <div className="bg-[#111111] border border-[rgba(239,68,68,0.15)] rounded p-4">
            <h3 className="text-[#7f1d1d] text-[10px] uppercase tracking-widest">
              DANGER ZONE
            </h3>
            <p className="text-[#444444] text-[11px] leading-relaxed mt-1.5">
              Once you delete a business, all its data, staff records, and booking
              history will be permanently erased. This action is irreversible.
            </p>
            <button
              type="button"
              data-testid="btn-delete-business"
              className="w-full bg-transparent border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-[11px] uppercase tracking-widest py-2 rounded mt-3.5 hover:bg-[rgba(239,68,68,0.06)] hover:border-[rgba(239,68,68,0.4)] transition-all"
            >
              DELETE BUSINESS
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
