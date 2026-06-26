'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateBusiness } from './actions';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ServicesPanel } from './ServicesPanel';
import { MapPin, Phone, Mail, Globe, Clock, Image as ImageIcon, X } from 'lucide-react';

type Business = {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  description: string | null;
  description_ka: string | null;
  opening_hours: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  status: string;
  business_categories?: { category_id: string }[];
};

type Category = {
  id: string;
  name: string;
  name_ka: string | null;
};

type Staff = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  is_active: boolean;
  created_at: string;
};

type Service = {
  id: string;
  name: string;
  name_ka: string | null;
  category: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number | null;
  is_active: boolean;
};

const AVATAR_COLORS = [
  'bg-[#d4a843] text-black',
  'bg-[#8b7355] text-white',
  'bg-[#4a4a4a] text-white',
  'bg-[#2a2a2a] text-[#d4a843]',
];

const OPENING_HOURS_OPTIONS = [
  { value: '', label: 'Select schedule...' },
  { value: 'Mon-Fri 9:00-18:00, Sat 10:00-16:00', label: 'Weekdays 9-6, Saturday 10-4' },
  { value: 'Mon-Sat 9:00-20:00', label: 'Monday to Saturday 9-8' },
  { value: 'Mon-Sun 9:00-21:00', label: 'Every day 9-9' },
  { value: 'Mon-Fri 8:00-17:00', label: 'Weekdays 8-5' },
  { value: 'Tue-Sun 10:00-19:00, Mon Closed', label: 'Tuesday to Sunday 10-7, Monday closed' },
];

export function EditBusinessForm({
  business,
  categoryIds,
  staff,
  allCategories,
  services,
}: {
  business: Business;
  categoryIds: string[];
  staff: Staff[];
  allCategories: Category[];
  services: Service[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryIds);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(business.cover_image_url);
  const [logoUrl, setLogoUrl] = useState<string | null>(business.logo_url);

  const availableCategories = allCategories.filter(
    (cat) => !selectedCategories.includes(cat.id)
  );

  const selectedCategoryObjects = allCategories.filter((cat) =>
    selectedCategories.includes(cat.id)
  );

  const publicUrl = business.subdomain
    ? `https://${business.subdomain}.rigify.ge`
    : 'No subdomain set';

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    // Append each category ID separately (action expects formData.getAll('categories'))
    selectedCategories.forEach(categoryId => {
      formData.append('categories', categoryId);
    });

    startTransition(async () => {
      const result = await updateBusiness(business.id, formData);

      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      } else {
        setMessage({ type: 'success', text: result.message });
        router.refresh();
      }
    });
  };

  const handleAddCategory = (categoryId: string) => {
    if (categoryId && !selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
  };

  const handleCopyUrl = () => {
    if (business.subdomain) {
      navigator.clipboard.writeText(`https://${business.subdomain}.rigify.ge`);
      setMessage({ type: 'success', text: 'URL copied to clipboard' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      {/* Main Form Column */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-nav">
          <h1 className="text-xl font-bold text-white">Edit Business</h1>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            data-testid="btn-back-to-admin"
            className="text-[#888888] hover:text-white text-sm uppercase tracking-wider transition-colors"
          >
            ← Back to Admin
          </button>
        </header>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mx-8 mt-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e]'
                : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]'
            }`}
            data-testid="form-message"
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form id="edit-business-form" action={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Section 1: Basic Info */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-[#cccccc] text-sm mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={business.name}
                  data-testid="input-business-name"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  required
                />
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-[#cccccc] text-sm mb-1.5">
                  Subdomain
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    defaultValue={business.subdomain || ''}
                    data-testid="input-subdomain"
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                    pattern="[a-z0-9-]+"
                    title="Only lowercase letters, numbers, and hyphens"
                  />
                  <span className="text-[#888888] text-sm">.rigify.ge</span>
                </div>
              </div>

              {/* Hidden fields */}
              <input type="hidden" name="slug" value={business.slug} />

              <div>
                <label htmlFor="status" className="block text-[#cccccc] text-sm mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={business.status}
                  data-testid="select-status"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-[#cccccc] text-sm mb-1.5">
                  Description (English)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={business.description || ''}
                  data-testid="input-description"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843] resize-none"
                />
              </div>

              <div>
                <label htmlFor="description_ka" className="block text-[#cccccc] text-sm mb-1.5">
                  Description (Georgian)
                </label>
                <textarea
                  id="description_ka"
                  name="description_ka"
                  rows={3}
                  defaultValue={business.description_ka || ''}
                  data-testid="input-description-ka"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843] resize-none"
                />
              </div>

              <div>
                <div className="block text-[#cccccc] text-sm mb-1.5">Categories</div>
                {selectedCategoryObjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCategoryObjects.map((cat) => (
                      <div
                        key={cat.id}
                        className="inline-flex items-center gap-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded px-2.5 py-1"
                      >
                        <span className="text-white text-sm">{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          data-testid={`btn-remove-category-${cat.id}`}
                          className="text-[#888888] hover:text-white transition-colors"
                          aria-label={`Remove ${cat.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {availableCategories.length > 0 && (
                  <select
                    onChange={(e) => {
                      handleAddCategory(e.target.value);
                      e.target.value = '';
                    }}
                    data-testid="select-add-category"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  >
                    <option value="">Add category...</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Section 2: Location */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-[#cccccc] text-sm mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    defaultValue={business.city || ''}
                    data-testid="input-city"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  />
                </div>

                <div>
                  <label htmlFor="district" className="block text-[#cccccc] text-sm mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    defaultValue={business.district || ''}
                    placeholder="e.g. Vake, Saburtalo"
                    data-testid="input-district"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-[#cccccc] text-sm mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  defaultValue={business.address || ''}
                  data-testid="input-address"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-[#cccccc] text-sm mb-1.5">
                    Latitude <span className="text-[#888888]">(for map view)</span>
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    min="-90"
                    max="90"
                    id="latitude"
                    name="latitude"
                    defaultValue={business.latitude ?? ''}
                    placeholder="41.7151377"
                    data-testid="edit-business-latitude-input"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-[#cccccc] text-sm mb-1.5">
                    Longitude <span className="text-[#888888]">(for map view)</span>
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    min="-180"
                    max="180"
                    id="longitude"
                    name="longitude"
                    defaultValue={business.longitude ?? ''}
                    placeholder="44.7831250"
                    data-testid="edit-business-longitude-input"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Section 3: Contact & Hours */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4">
              Contact &amp; Hours
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={business.phone || ''}
                  data-testid="input-phone"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={business.email || ''}
                  data-testid="input-email"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  defaultValue={business.website || ''}
                  data-testid="input-website"
                  placeholder="https://example.com"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                />
              </div>

              <div>
                <label htmlFor="instagram" className="block text-[#cccccc] text-sm mb-1.5">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  defaultValue={business.instagram || ''}
                  placeholder="@username"
                  data-testid="input-instagram"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                />
              </div>

              <div>
                <label htmlFor="hours" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </label>
                <select
                  id="hours"
                  name="hours"
                  defaultValue={business.opening_hours || ''}
                  data-testid="select-opening-hours"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                >
                  {OPENING_HOURS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Section 4: Brand Assets */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Brand Assets
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="block text-[#cccccc] text-sm mb-1.5">Cover Image</div>
                <input type="hidden" name="cover_image_url" value={coverImageUrl ?? ''} />
                <ImageUpload
                  businessId={business.id}
                  type="cover"
                  variant="admin"
                  currentUrl={coverImageUrl}
                  onUploadComplete={setCoverImageUrl}
                />
              </div>

              <div>
                <div className="block text-[#cccccc] text-sm mb-1.5">Logo</div>
                <input type="hidden" name="logo_url" value={logoUrl ?? ''} />
                <ImageUpload
                  businessId={business.id}
                  type="logo"
                  variant="admin"
                  currentUrl={logoUrl}
                  onUploadComplete={setLogoUrl}
                />
              </div>
            </div>
          </section>

        </form>

        {/* Services management — full width, above the save button. Lives outside
            the business <form> (it has its own forms); the Save button below
            submits the business form via its form="edit-business-form" attribute. */}
        <div className="px-8 py-6 border-t border-[#2a2a2a]">
          <ServicesPanel services={services} businessId={business.id} />
        </div>

        {/* Submit Button — saves the business fields above */}
        <div className="px-8 pb-10">
          <button
            type="submit"
            form="edit-business-form"
            disabled={isPending}
            data-testid="btn-save-changes"
            className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-sm px-6 py-2.5 rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>

      {/* Right Sidebar - Panels */}
      <aside className="w-[300px] bg-[#111111] border-l border-[#2a2a2a] flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Live Status Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">
              Live Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#cccccc] text-sm">Status</span>
                <span
                  className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
                    business.status === 'active'
                      ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]'
                      : 'bg-[rgba(100,100,100,0.1)] text-[#888888] border border-[#444444]'
                  }`}
                >
                  {business.status}
                </span>
              </div>

              <div>
                <span className="text-[#cccccc] text-sm block mb-1">Public URL</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[#d4a843] text-xs bg-[#1a1a1a] px-2 py-1.5 rounded border border-[#2a2a2a] truncate font-mono">
                    {publicUrl}
                  </code>
                  {business.subdomain && (
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      data-testid="btn-copy-url"
                      className="text-[#888888] hover:text-white transition-colors"
                      aria-label="Copy URL"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Staff Members Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">
              Staff Members
            </h3>
            {staff.length > 0 ? (
              <div className="space-y-2">
                {staff.slice(0, 4).map((member, index) => {
                  const initials = member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const avatarClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3"
                      data-testid={`staff-member-${member.id}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarClass}`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{member.name}</p>
                        <p className="text-[#888888] text-xs truncate">
                          {member.role || 'Staff'}
                        </p>
                      </div>
                      {!member.is_active && (
                        <span className="text-[#888888] text-xs">Inactive</span>
                      )}
                    </div>
                  );
                })}
                {staff.length > 4 && (
                  <p className="text-[#888888] text-xs">
                    +{staff.length - 4} more staff members
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[#888888] text-sm">No staff members yet</p>
            )}
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Danger Zone Panel */}
          <section>
            <h3 className="text-[#ef4444] text-[11px] uppercase tracking-widest mb-3">
              Danger Zone
            </h3>
            <button
              type="button"
              data-testid="btn-delete-business"
              className="w-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm px-4 py-2 rounded hover:bg-[rgba(239,68,68,0.2)] transition-colors"
            >
              Delete Business
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
