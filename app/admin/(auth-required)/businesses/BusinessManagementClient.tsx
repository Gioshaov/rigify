'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toggleBusinessStatus } from './actions';
import { useConfirm } from '@/lib/contexts/ConfirmContext';
import { useToast } from '@/lib/contexts/ToastContext';

type Business = {
  id: string;
  name: string;
  subdomain: string | null;
  status: string;
  city: string;
  district: string | null;
  created_at: string;
};

type BusinessManagementClientProps = {
  businesses: Business[];
  totalCount: number;
};

export function BusinessManagementClient({ businesses, totalCount }: BusinessManagementClientProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const showToast = useToast();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, string>>({});

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      if (selectedCity !== 'all' && business.city !== selectedCity) {
        return false;
      }
      if (selectedDistrict !== 'all' && business.district !== selectedDistrict) {
        return false;
      }
      if (selectedStatus !== 'all' && business.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [businesses, selectedCity, selectedDistrict, selectedStatus]);

  const clearFilters = () => {
    setSelectedCity('all');
    setSelectedDistrict('all');
    setSelectedStatus('all');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePopoverAction = async (action: string, businessId: string, business: Business) => {
    setOpenPopoverId(null);

    if (action === 'edit') {
      router.push(`/admin/businesses/${businessId}/edit`);
    } else if (action === 'view-profile') {
      if (business.subdomain) {
        window.open(`https://${business.subdomain}.rigify.ge`, '_blank');
      } else {
        showToast('This business does not have a subdomain configured.', 'info');
      }
    } else if (action === 'manage-staff') {
      router.push(`/admin/businesses/${businessId}/edit#staff`);
    } else if (action === 'deactivate') {
      const currentStatus = optimisticStatus[businessId] || business.status;
      const actionText = currentStatus === 'active' ? 'deactivate' : 'activate';
      if (!(await confirm({
        title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} "${business.name}"?`,
        confirmLabel: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        destructive: actionText === 'deactivate',
        testId: 'toggle-business-status',
      }))) {
        return;
      }

      setActionInProgress(businessId);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const result = await toggleBusinessStatus(businessId, currentStatus);
      setActionInProgress(null);

      if (result.error) {
        showToast(`Failed to ${actionText} business: ${result.error}`, 'error');
      } else {
        // Set optimistic status immediately
        setOptimisticStatus(prev => ({ ...prev, [businessId]: newStatus }));
        router.refresh();
      }
    }
  };

  // Get unique cities and districts for filters
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(businesses.map(b => b.city).filter(Boolean)));
    return uniqueCities;
  }, [businesses]);

  const districts = useMemo(() => {
    const uniqueDistricts = Array.from(new Set(businesses.map(b => b.district).filter((d): d is string => d !== null)));
    return uniqueDistricts;
  }, [businesses]);

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      <AdminSidebar />

      <main className="flex-1 ml-60 overflow-y-auto pb-12">
        {/* Page Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Business Management
            </h1>
            <p className="text-[#6b6880] font-mono text-sm uppercase tracking-wider">
              {totalCount} businesses total
            </p>
          </div>
          <Link
            href="/admin/onboard"
            data-testid="new-business-btn"
            className="h-9 px-6 border border-[#d4a843] text-[#d4a843] font-mono text-xs uppercase tracking-wider rounded-none hover:bg-[#d4a843] hover:text-black transition-colors flex items-center"
          >
            + New Business
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="border-b border-[rgba(255,255,255,0.06)] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* City Filter */}
              <select
                data-testid="filter-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-9 px-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
                style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
              >
                <option value="all">CITY: ALL</option>
                {cities.map(city => (
                  <option key={city} value={city}>CITY: {city.toUpperCase()}</option>
                ))}
              </select>

              {/* District Filter */}
              <select
                data-testid="filter-district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 px-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
                style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
              >
                <option value="all">DISTRICT: ALL</option>
                {districts.map(district => (
                  <option key={district} value={district}>DISTRICT: {district.toUpperCase()}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                data-testid="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-4 bg-[#111111] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
                style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
              >
                <option value="all">STATUS: ALL</option>
                <option value="active">STATUS: ACTIVE</option>
                <option value="inactive">STATUS: INACTIVE</option>
                <option value="draft">STATUS: DRAFT</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              data-testid="clear-filters-btn"
              onClick={clearFilters}
              className="text-[#6b6880] font-mono text-xs uppercase tracking-wider hover:text-white transition-colors"
            >
              × Clear Filters
            </button>
          </div>

          {/* Results Count */}
          <div className="mt-3">
            <p className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
              Showing {filteredBusinesses.length} of {totalCount} businesses
            </p>
          </div>
        </div>

        {/* Column Headers */}
        <div className="px-8 py-3 border-b border-[rgba(255,255,255,0.06)] grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4">
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Entity & Subdomain
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Location
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Status
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Onboarded
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider text-right">
            Actions
          </div>
        </div>

        {/* Business Rows */}
        <div>
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="relative px-8 py-4 bg-[#111111] border-b border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a] hover:border-l-[1px] hover:border-l-[#d4a843] transition-all grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 items-center min-h-[64px]"
            >
              {/* Entity & Subdomain */}
              <div>
                <div data-testid={`business-name-${business.id}`} className="text-white text-[15px] font-medium mb-1">
                  {business.name}
                </div>
                <div className="text-[#6b6880] font-mono text-[11px]">
                  {business.subdomain ? `${business.subdomain}.rigify.ge` : '—'}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="text-[#6b6880] font-mono text-[9px] uppercase tracking-wider mb-1">
                  City
                </div>
                <div className="text-white font-mono text-[11px] capitalize">
                  {business.city || '—'}
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-2" data-testid={`business-status-${business.id}`}>
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      business.status === 'active' ? 'bg-[#d4a843]' : 'bg-[#6b6880]'
                    }`}
                  />
                  <span className={`font-mono text-[11px] uppercase tracking-wider ${
                    business.status === 'active' ? 'text-white' : 'text-[#6b6880]'
                  }`}>
                    {business.status}
                  </span>
                </div>
              </div>

              {/* Onboarded */}
              <div className="text-[#6b6880] font-mono text-[11px]">
                {formatDate(business.created_at)}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/businesses/${business.id}/edit`}
                  data-testid={`business-edit-btn-${business.id}`}
                  className="h-7 px-3 border border-[rgba(255,255,255,0.12)] text-white font-mono text-[11px] uppercase rounded-none hover:border-white transition-colors flex items-center"
                >
                  Edit
                </Link>
                <button
                  data-testid={`business-menu-btn-${business.id}`}
                  onClick={() => setOpenPopoverId(openPopoverId === business.id ? null : business.id)}
                  className="w-7 h-7 flex items-center justify-center text-[#6b6880] hover:text-white transition-colors"
                >
                  ⋮
                </button>
              </div>

              {/* Popover */}
              {openPopoverId === business.id && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenPopoverId(null)}
                  />

                  {/* Popover Content */}
                  <div
                    data-testid={`business-popover-${business.id}`}
                    className="absolute right-8 top-full mt-1 w-[220px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.15)] rounded-none shadow-lg z-dropdown animate-[fadeIn_150ms_ease-out]"
                    style={{
                      animation: 'fadeIn 150ms ease-out',
                    }}
                  >
                    {/* Business Name Header */}
                    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                      <div className="text-white text-sm font-semibold">
                        {business.name}
                      </div>
                    </div>

                    {/* Action Items */}
                    <div>
                      <button
                        data-testid={`popover-edit-${business.id}`}
                        onClick={() => handlePopoverAction('edit', business.id, business)}
                        disabled={actionInProgress === business.id}
                        className="w-full h-9 px-4 text-left text-white font-mono text-xs hover:bg-[rgba(255,255,255,0.04)] transition-colors border-b border-[rgba(255,255,255,0.06)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit details
                      </button>
                      <button
                        data-testid={`popover-view-profile-${business.id}`}
                        onClick={() => handlePopoverAction('view-profile', business.id, business)}
                        disabled={actionInProgress === business.id}
                        className="w-full h-9 px-4 text-left text-white font-mono text-xs hover:bg-[rgba(255,255,255,0.04)] transition-colors border-b border-[rgba(255,255,255,0.06)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        View profile
                      </button>
                      <button
                        data-testid={`popover-manage-staff-${business.id}`}
                        onClick={() => handlePopoverAction('manage-staff', business.id, business)}
                        disabled={actionInProgress === business.id}
                        className="w-full h-9 px-4 text-left text-white font-mono text-xs hover:bg-[rgba(255,255,255,0.04)] transition-colors border-b border-[rgba(255,255,255,0.06)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Manage staff
                      </button>
                      <button
                        data-testid={`popover-deactivate-${business.id}`}
                        onClick={() => handlePopoverAction('deactivate', business.id, business)}
                        disabled={actionInProgress === business.id}
                        className={`w-full h-9 px-4 text-left font-mono text-xs hover:bg-[rgba(255,255,255,0.04)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          (optimisticStatus[business.id] || business.status) === 'active' ? 'text-[#ff6b6b]' : 'text-[#22c55e]'
                        }`}
                      >
                        {(optimisticStatus[business.id] || business.status) === 'active' ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-0 left-60 right-0 h-8 bg-[#0a0a0a] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between px-8 z-nav">
          <div className="flex items-center gap-2">
            <div className="w-[5px] h-[5px] rounded-full bg-green-500" />
            <span className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
              System Operational
            </span>
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            API V2.4.8-GOLD
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Last Updated: {new Date().toUTCString().split(' ')[4]} GMT
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
