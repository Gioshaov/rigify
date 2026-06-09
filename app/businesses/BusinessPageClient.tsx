"use client";

import { useState, useMemo } from "react";
import { BusinessGrid } from "./BusinessGrid";
import { TBILISI_DISTRICTS } from "@/lib/constants/districts";
import { CATEGORIES } from "@/lib/constants/categories";

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
  business_categories: Array<{ category_id: string }>;
};

type SortOption = "featured" | "rating" | "name" | "reviews";

export function BusinessPageClient({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    let filtered = initialBusinesses.filter((business) => {
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
  }, [initialBusinesses, searchQuery, selectedDistrict, selectedCategory, sortBy]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || selectedDistrict !== "all" || selectedCategory !== "all";

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDistrict("all");
    setSelectedCategory("all");
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
            <select
              data-testid="browse-studios-district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Districts</option>
              {TBILISI_DISTRICTS.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.en}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-64">
            <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2 block">
              Category
            </label>
            <select
              data-testid="browse-studios-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.en}
                </option>
              ))}
            </select>
          </div>

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
      <main className="px-4 md:px-margin-desktop py-12">
        <div className="max-w-container mx-auto">
          {/* Results Header with Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase tracking-tight">
                {hasActiveFilters ? "Search Results" : "All Businesses"}
              </h2>
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-2">
                Showing {filteredBusinesses.length} of {initialBusinesses.length}
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
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-surface-container-low border border-white/10 focus:border-primary px-4 py-2 text-on-surface outline-none appearance-none cursor-pointer font-mono text-[12px] tracking-[0.15em] uppercase"
                >
                  <option value="featured">Featured</option>
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
                  onClick={() => setSelectedCategory("all")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] tracking-[0.15em] uppercase hover:bg-primary/20 transition-colors"
                >
                  Category: {CATEGORIES.find(c => c.id === selectedCategory)?.en}
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

          {/* Business Grid */}
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low sharp-border">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">
                search_off
              </span>
              <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-2">
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
            <BusinessGrid businesses={filteredBusinesses} />
          )}
        </div>
      </main>
    </>
  );
}
