'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_min: number;
  price_max: number;
  duration_minutes: number;
  is_active: boolean;
};

type EditServiceFormProps = {
  service: Service;
  businessId: string;
};

export function EditServiceForm({ service, businessId }: EditServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description || '',
    category: service.category || 'other',
    duration_minutes: service.duration_minutes,
    price_min: service.price_min,
    price_max: service.price_max,
    is_active: service.is_active,
  });

  const categories = [
    { value: 'hair', label: 'Hair Services' },
    { value: 'beard', label: 'Beard & Shave' },
    { value: 'massage', label: 'Massage & Spa' },
    { value: 'nails', label: 'Nail Services' },
    { value: 'skincare', label: 'Skincare & Facial' },
    { value: 'other', label: 'Other Services' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          duration_minutes: formData.duration_minutes,
          price_min: formData.price_min,
          price_max: formData.price_max,
          is_active: formData.is_active,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update service');
      }

      router.push('/dashboard/services');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4">
          <p className="font-hanken text-[14px] leading-[1.5] font-normal">{error}</p>
        </div>
      )}

      {/* Main Fields */}
      <div className="bg-surface-container border border-white/5 p-8">
        <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase mb-6">
          Service Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Name */}
          <div className="md:col-span-2 space-y-2">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Service Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-container-low border border-white/10 px-4 py-4 text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/30 font-hanken text-[16px] leading-[1.5] font-normal"
              placeholder="e.g., Classic Cut & Steam"
              required
              data-testid="edit-service-name-input"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-surface-container-low border border-white/10 px-4 py-4 text-on-background focus:outline-none focus:border-primary transition-colors font-hanken text-[16px] leading-[1.5] font-normal"
              data-testid="edit-service-category-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Status
            </label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full bg-surface-container-low border border-white/10 px-4 py-4 text-on-background focus:outline-none focus:border-primary transition-colors font-hanken text-[16px] leading-[1.5] font-normal"
              data-testid="edit-service-status-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-2">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface-container-low border border-white/10 px-4 py-4 text-on-background focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-on-surface-variant/30 font-hanken text-[16px] leading-[1.5] font-normal"
              placeholder="Detail the experience, techniques, and products used..."
              rows={4}
              data-testid="edit-service-description-textarea"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Duration (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-container-low border border-white/10 px-4 py-4 text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/30 font-hanken text-[16px] leading-[1.5] font-normal"
                placeholder="45"
                required
                min="1"
                data-testid="edit-service-duration-input"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Price (GEL)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={formData.price_min}
                  onChange={(e) => setFormData({ ...formData, price_min: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-container-low border border-white/10 px-4 py-4 pl-14 text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/30 font-hanken text-[16px] leading-[1.5] font-normal"
                  placeholder="0.00"
                  step="0.01"
                  required
                  min="0"
                  data-testid="edit-service-price-min-input"
                />
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary">₾</span>
                </div>
              </div>
              <span className="text-on-surface-variant">to</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={formData.price_max}
                  onChange={(e) => setFormData({ ...formData, price_max: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-container-low border border-white/10 px-4 py-4 pl-14 text-on-background focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/30 font-hanken text-[16px] leading-[1.5] font-normal"
                  placeholder="0.00"
                  step="0.01"
                  required
                  min="0"
                  data-testid="edit-service-price-max-input"
                />
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary">₾</span>
                </div>
              </div>
            </div>
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant">
              Set same value for fixed price
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/services"
          className="flex-1 px-8 py-4 border border-white/10 text-on-surface hover:border-primary/30 transition-colors font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium text-center"
          data-testid="edit-service-cancel-btn"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary text-background px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="edit-service-save-btn"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}
