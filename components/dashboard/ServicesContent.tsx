'use client'

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DeleteServiceModal } from "@/components/dashboard/DeleteServiceModal";
import { Toast } from "@/components/ui/Toast";

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

type ServicesContentProps = {
  businessId: string;
  services: Service[];
};

export function ServicesContent({ businessId, services }: ServicesContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Delete modal state
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Read from URL or use defaults
  const filterCategory = searchParams.get('category') || 'all';
  const filterStatus = searchParams.get('status') || 'all';

  // Helper to update URL params
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Filter services
  const filteredServices = services.filter(service => {
    if (filterCategory !== 'all' && service.category !== filterCategory) return false;
    if (filterStatus === 'active' && !service.is_active) return false;
    if (filterStatus === 'inactive' && service.is_active) return false;
    return true;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(
      services
        .map(s => s.category)
        .filter((cat): cat is string => cat !== null && cat !== undefined)
    )
  );

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    hair: 'content_cut',
    beard: 'face_retouching_natural',
    massage: 'spa',
    nails: 'brush',
    skincare: 'face',
    other: 'category',
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters({ status: 'all' })}
              className={`
                px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                ${filterStatus === 'all'
                  ? 'border-2 border-primary text-primary'
                  : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                }
              `}
            >
              All
            </button>
            <button
              onClick={() => updateFilters({ status: 'active' })}
              className={`
                px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                ${filterStatus === 'active'
                  ? 'border-2 border-primary text-primary'
                  : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                }
              `}
            >
              Active
            </button>
            <button
              onClick={() => updateFilters({ status: 'inactive' })}
              className={`
                px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                ${filterStatus === 'inactive'
                  ? 'border-2 border-primary text-primary'
                  : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                }
              `}
            >
              Inactive
            </button>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="bg-surface-container border border-white/10 px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium text-on-surface outline-none hover:border-primary/30 transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Add Service Button */}
        <Link
          href="/dashboard/services/new"
          className="bg-primary text-background px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95"
          data-testid="add-service-btn"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Service
          </span>
        </Link>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="bg-surface-container border border-white/5 p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-[32px]">content_cut</span>
          </div>
          <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-6">
            No services found
          </p>
          <Link
            href="/dashboard/services/new"
            className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const categoryIcon = service.category ? categoryIcons[service.category] || 'category' : 'category';
            const priceDisplay = service.price_min === service.price_max
              ? `₾${service.price_min.toFixed(0)}`
              : `₾${service.price_min.toFixed(0)} - ₾${service.price_max.toFixed(0)}`;

            return (
              <div
                key={service.id}
                className="group bg-surface-container-low border border-white/10 hover:border-primary/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all"
                data-testid={`service-${service.id}`}
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-surface-container-highest border border-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[28px]">
                      {categoryIcon}
                    </span>
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-pure-white">
                        {service.name}
                      </h3>
                      {!service.is_active && (
                        <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase border border-white/10">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant font-hanken text-[14px] leading-[1.5] font-normal max-w-md">
                      {service.description || 'No description'}
                    </p>
                  </div>
                </div>

                {/* Right: Duration, Price & Actions */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-8 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  {/* Duration */}
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-1">
                      Duration
                    </span>
                    <div className="flex items-center gap-2 text-pure-white">
                      <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                      <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium">
                        {service.duration_minutes} MIN
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-1">
                      Price
                    </span>
                    <span className="font-hanken text-[24px] leading-[1.3] font-bold text-primary">
                      {priceDisplay}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 ml-auto">
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="p-3 border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary transition-all active:scale-90"
                      data-testid={`edit-service-${service.id}`}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="p-3 border border-white/10 text-on-surface-variant hover:text-error hover:border-error transition-all active:scale-90"
                      data-testid={`delete-service-${service.id}`}
                      title="Delete service"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Count */}
      <div className="mt-8 text-center">
        <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
          Showing {filteredServices.length} of {services.length} services
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <DeleteServiceModal
          serviceName={serviceToDelete.name}
          serviceId={serviceToDelete.id}
          onClose={() => setServiceToDelete(null)}
          onSuccess={() => {
            setToast({
              message: `${serviceToDelete.name} deleted successfully`,
              type: "success",
            });
            router.refresh();
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
