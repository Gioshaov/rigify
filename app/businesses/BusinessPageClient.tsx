"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { BusinessGrid } from "./BusinessGrid";
import { ViewModeToggle } from "./ViewModeToggle";
import { BusinessMapView } from "./BusinessMapView";
import { BusinessSplitView } from "./BusinessSplitView";
import { useGeolocation, calculateDistance } from "@/lib/utils/geolocation";
import { TBILISI_DISTRICTS } from "@/lib/constants/districts";
import { CATEGORIES } from "@/lib/constants/categories";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string;
  district: string | null;
  address: string;
  cover_image_url: string | null;
  logo_url: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  business_categories: Array<{ category_id: string }>;
  distance?: number;
};

type SortOption = "featured" | "rating" | "name" | "reviews" | "nearme";
type ViewMode = 'list' | 'map' | 'split';

type BusinessWithCoords = Business & { latitude: number; longitude: number };

// Type guard to filter businesses with coordinates
function hasCoordinates(business: Business): business is BusinessWithCoords {
  return business.latitude != null && business.longitude != null;
}

export function BusinessPageClient({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mapRef = useRef<any>(null);

  // Geolocation (silent, no error if denied)
  const { userLocation } = useGeolocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  // Initialize category filter from URL (?category=) so landing-page category
  // cards pre-filter on arrival. Unknown values (e.g. cosmetology, tattoo —
  // categories that don't exist yet) pass through and yield an empty result set
  // by design, surfacing the existing "No Businesses Found" empty state.
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => searchParams.get("category") ?? "all"
  );
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [flyToUserLocation, setFlyToUserLocation] = useState(false);

  // View mode from URL (deterministic initialization to avoid hydration mismatch)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const urlView = searchParams.get('view') as ViewMode | null;
    if (urlView && ['list', 'map', 'split'].includes(urlView)) {
      return urlView;
    }
    return 'list'; // default (localStorage restored in effect)
  });

  // Restore view from localStorage after hydration
  useEffect(() => {
    const urlView = searchParams.get('view');
    if (!urlView && typeof window !== 'undefined') {
      const saved = localStorage.getItem('rigify-map-view') as ViewMode | null;
      if (saved && ['list', 'map', 'split'].includes(saved)) {
        setViewMode(saved);
      }
    }
    // Run once on mount only; reading `searchParams` here is the initial snapshot by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync view mode with URL changes (browser back/forward)
  useEffect(() => {
    const urlView = searchParams.get('view') as ViewMode | null;
    if (urlView && ['list', 'map', 'split'].includes(urlView)) {
      setViewMode(urlView);
    } else if (!urlView) {
      // URL has no view param, fallback to localStorage or default
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('rigify-map-view') as ViewMode | null;
        if (saved && ['list', 'map', 'split'].includes(saved)) {
          setViewMode(saved);
        } else {
          setViewMode('list');
        }
      }
    }
  }, [searchParams]); // Re-run when URL params change

  // Listen for custom event from Browse links to reset to list view
  useEffect(() => {
    const handleResetToList = () => {
      setViewMode('list');
      localStorage.setItem('rigify-map-view', 'list');
    };

    window.addEventListener('resetToListView', handleResetToList);
    return () => window.removeEventListener('resetToListView', handleResetToList);
  }, []);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force LIST if mobile and SPLIT selected
  const effectiveViewMode = isMobile && viewMode === 'split' ? 'list' : viewMode;

  // Handle view change
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('view', mode);
    router.push(`${pathname}?${params.toString()}`);

    // Save to localStorage
    localStorage.setItem('rigify-map-view', mode);
  };

  // Handle category change — keep the URL ?category= in sync with the filter.
  // Category is the one filter initialized from the URL (landing-page cards link
  // with ?category=), so it must round-trip; otherwise a stale value lingers in
  // the URL after the user clears it. (search/district stay session-only.)
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  // Title-case a raw category id for display — used for ?category= values that
  // aren't in CATEGORIES yet (e.g. cosmetology, tattoo) so the label reads
  // "Cosmetology" instead of "cosmetology".
  const formatCategoryLabel = (id: string) =>
    id.charAt(0).toUpperCase() + id.slice(1);

  // Enrich businesses with distance if user location available
  const businessesWithDistance = useMemo(() => {
    if (!userLocation) return initialBusinesses;

    return initialBusinesses.map((business) => {
      // Skip businesses without coordinates
      if (business.latitude == null || business.longitude == null) {
        return business;
      }

      return {
        ...business,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.latitude,
          business.longitude
        ),
      };
    });
  }, [initialBusinesses, userLocation]);

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    let filtered = businessesWithDistance.filter((business) => {
      // District filter
      if (selectedDistrict !== "all") {
        if (!business.district) return false;

        // Check if business matches selected district (ID or legacy name match)
        const idMatch = business.district === selectedDistrict;
        const districtInfo = TBILISI_DISTRICTS.find(d => d.id === selectedDistrict);
        const legacyMatch = districtInfo
          ? business.district.toLowerCase().trim() === districtInfo.en.toLowerCase() ||
            business.district.trim() === districtInfo.ka
          : false;

        // If no match, filter out this business
        if (!idMatch && !legacyMatch) return false;
        // If match, fall through to check category and search filters
      }

      // Category filter
      if (selectedCategory !== "all") {
        const hasCategory = business.business_categories.some(
          (bc) => bc.category_id === selectedCategory
        );
        if (!hasCategory) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = business.name.toLowerCase().includes(query);
        const matchesDescription = business.description
          ?.toLowerCase()
          .includes(query);
        const matchesAddress = business.address.toLowerCase().includes(query);

        if (!matchesName && !matchesDescription && !matchesAddress) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "nearme":
          // Sort by distance (only works if user location available)
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "reviews":
          return b.review_count - a.review_count;
        case "name":
          return a.name.localeCompare(b.name);
        case "featured":
        default:
          // Featured: Sort by rating * review_count (engagement score)
          const scoreA = (a.rating ?? 0) * a.review_count;
          const scoreB = (b.rating ?? 0) * b.review_count;
          return scoreB - scoreA;
      }
    });

    return sorted;
  }, [businessesWithDistance, searchQuery, selectedDistrict, selectedCategory, sortBy]);

  // Businesses that can appear on the map. The map and split views drop rows
  // with null lat/long; the list view shows all of filteredBusinesses. Computed
  // once here so the results count and the view branches stay in sync.
  const mappableBusinesses = useMemo(
    () => filteredBusinesses.filter(hasCoordinates),
    [filteredBusinesses]
  );

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || selectedDistrict !== "all" || selectedCategory !== "all";

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDistrict("all");
    // Only touch the URL when category is actually set. handleCategoryChange
    // always router.push()es, so calling it when category is already "all"
    // (e.g. only search/district were active) adds a phantom back-step.
    if (selectedCategory !== "all") {
      handleCategoryChange("all");
    }
  };

  return (
    <>
      {/* Search & Filters - Stitch Design */}
      <section className="relative z-20 -mt-12 px-4 md:px-margin-desktop">
        <div className="max-w-container mx-auto bg-surface-elevated sharp-border p-6 md:p-8 flex flex-col md:flex-row gap-4 items-end">
          {/* Search Box */}
          <div className="flex-1 w-full">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              Find Artisan
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                data-testid="browse-studios-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-12 py-3 text-on-surface placeholder:text-outline outline-none transition-all"
                placeholder="Salon, Barber, or Stylist..."
                type="text"
              />
            </div>
          </div>

          {/* District Dropdown */}
          <div className="w-full md:w-64">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              District
            </label>
            <FilterDropdown
              testId="district-dropdown"
              optionTestId="district"
              ariaLabel="District"
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              options={[
                { value: "all", label: "All Districts" },
                ...TBILISI_DISTRICTS.map((district) => ({ value: district.id, label: district.en })),
              ]}
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-64">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              Category
            </label>
            {/* Options keep the unknown ?category= value (e.g. cosmetology, tattoo)
                as its own entry so the control reflects the active filter instead
                of falsely showing "All Categories". */}
            <FilterDropdown
              testId="category-dropdown"
              optionTestId="category"
              ariaLabel="Category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={[
                { value: "all", label: "All Categories" },
                ...(selectedCategory !== "all" && !CATEGORIES.some((cat) => cat.id === selectedCategory)
                  ? [{ value: selectedCategory, label: formatCategoryLabel(selectedCategory) }]
                  : []),
                ...CATEGORIES.map((cat) => ({ value: cat.id, label: cat.en })),
              ]}
            />
          </div>

          {/* Near Me Button */}
          <button
            data-testid="browse-studios-near-me-btn"
            onClick={() => {
              if (userLocation) {
                setSortBy('nearme');
                setFlyToUserLocation(true);
                // Switch to map view if in list view
                if (effectiveViewMode === 'list') {
                  handleViewChange('map');
                }
              }
            }}
            disabled={!userLocation}
            className={`flex items-center gap-2 px-6 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold transition-colors h-[50px] w-full md:w-auto ${
              userLocation && sortBy === 'nearme' && effectiveViewMode !== 'list'
                ? 'bg-primary text-on-primary border-2 border-primary'
                : userLocation
                ? 'bg-surface-container-low text-on-surface border-2 border-white/10 hover:border-primary/50'
                : 'bg-surface-container-low text-on-surface-variant border-2 border-white/10 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {userLocation ? 'my_location' : 'location_searching'}
            </span>
            {userLocation && sortBy === 'nearme' && effectiveViewMode !== 'list' ? 'Showing Near Me' : 'Near Me'}
          </button>

          {/* Discover Button */}
          <button
            data-testid="browse-studios-search-btn"
            className="bg-primary text-on-secondary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors h-[50px] w-full md:w-auto"
          >
            Discover
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 md:px-margin-desktop py-6 md:py-8">
        <div className="max-w-container mx-auto">
          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={effectiveViewMode}
            onViewChange={handleViewChange}
            isMobile={isMobile}
          />

          {/* Results Header with Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase tracking-tight">
                {hasActiveFilters ? "Search Results" : "All Businesses"}
              </h2>
              <p data-testid="browse-studios-results-count" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-2">
                Showing {effectiveViewMode === 'list' ? filteredBusinesses.length : mappableBusinesses.length} of {initialBusinesses.length}
              </p>
            </div>

            {/* Sort Dropdown */}
            {initialBusinesses.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                  Sort By
                </label>
                <select
                  data-testid="browse-studios-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    const newSort = e.target.value as SortOption;
                    setSortBy(newSort);
                    if (newSort === 'nearme' && userLocation) {
                      setFlyToUserLocation(true);
                    }
                  }}
                  className="bg-surface-container-low border border-white/10 focus:border-primary px-4 py-2 text-on-surface outline-none appearance-none cursor-pointer font-mono text-[12px] tracking-[0.15em] uppercase"
                >
                  <option value="featured">Featured</option>
                  {userLocation && (
                    <option value="nearme">Near Me</option>
                  )}
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                Active Filters:
              </span>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary/20 transition-colors"
                >
                  Search: &quot;{searchQuery}&quot;
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}

              {selectedDistrict !== "all" && (
                <button
                  onClick={() => setSelectedDistrict("all")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary/20 transition-colors"
                >
                  District: {TBILISI_DISTRICTS.find(d => d.id === selectedDistrict)?.en}
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}

              {selectedCategory !== "all" && (
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary/20 transition-colors"
                >
                  Category: {CATEGORIES.find(c => c.id === selectedCategory)?.en ?? formatCategoryLabel(selectedCategory)}
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}

              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-on-surface-variant font-mono text-[10px] tracking-[0.15em] uppercase hover:border-error hover:text-error transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Business Content - View-dependent */}
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low sharp-border">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">
                search_off
              </span>
              <h3 data-testid="browse-studios-empty-state-title" className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-2">
                No Businesses Found
              </h3>
              <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters or search terms"
                  : "No businesses available at this time"
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="bg-primary text-on-primary px-6 py-3 font-mono text-[12px] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {effectiveViewMode === 'list' && (
                <BusinessGrid businesses={filteredBusinesses} />
              )}

              {effectiveViewMode === 'map' && (mappableBusinesses.length === 0 ? (
                  <div data-testid="browse-studios-map-no-coordinates" className="text-center py-16 bg-surface-container-low sharp-border">
                    <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">
                      location_off
                    </span>
                    <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-2">
                      No Businesses With Map Coordinates
                    </h3>
                    <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase mb-6">
                      {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found, but {filteredBusinesses.length === 1 ? 'it has' : 'they have'} no map coordinates yet
                    </p>
                    <button
                      onClick={() => handleViewChange('list')}
                      className="bg-primary text-on-primary px-6 py-3 font-mono text-[12px] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors"
                    >
                      View as List
                    </button>
                  </div>
                ) : (
                  <BusinessMapView
                    businesses={mappableBusinesses}
                    userLocation={userLocation}
                    flyToUserLocation={flyToUserLocation}
                    onFlyComplete={() => setFlyToUserLocation(false)}
                  />
                ))}

              {effectiveViewMode === 'split' && (mappableBusinesses.length === 0 ? (
                  <div data-testid="browse-studios-split-no-coordinates" className="text-center py-16 bg-surface-container-low sharp-border">
                    <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">
                      location_off
                    </span>
                    <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-2">
                      No Businesses With Map Coordinates
                    </h3>
                    <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase mb-6">
                      {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found, but {filteredBusinesses.length === 1 ? 'it has' : 'they have'} no map coordinates yet
                    </p>
                    <button
                      onClick={() => handleViewChange('list')}
                      className="bg-primary text-on-primary px-6 py-3 font-mono text-[12px] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors"
                    >
                      View as List
                    </button>
                  </div>
                ) : (
                  <BusinessSplitView
                    businesses={mappableBusinesses}
                    userLocation={userLocation}
                    flyToUserLocation={flyToUserLocation}
                    onFlyComplete={() => setFlyToUserLocation(false)}
                    mapRef={mapRef}
                  />
                ))}
            </>
          )}
        </div>
      </main>
    </>
  );
}
