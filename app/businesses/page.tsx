"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/ui/UserMenu";
import { createClient } from "@/lib/supabase/client";
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

export default function BrowseBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch businesses from Supabase
  useEffect(() => {
    async function fetchBusinesses() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          slug,
          city,
          district,
          address,
          description,
          cover_image_url,
          logo_url,
          rating,
          review_count,
          is_active,
          business_categories(category_id)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching businesses:', error);
      } else {
        setBusinesses(data || []);
      }
      setLoading(false);
    }

    fetchBusinesses();
  }, []);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      // District filter
      if (selectedDistrict !== "all") {
        if (!business.district) return false;

        // Primary match: ID-based
        if (business.district === selectedDistrict) return true;

        // Fallback for legacy data: check name matches
        const districtInfo = TBILISI_DISTRICTS.find(d => d.id === selectedDistrict);
        if (districtInfo) {
          const businessDistrict = business.district.toLowerCase().trim();
          if (businessDistrict === districtInfo.en.toLowerCase() ||
              business.district.trim() === districtInfo.ka) {
            return true;
          }
        }

        return false;
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
  }, [businesses, searchQuery, selectedDistrict, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full z-50 flex items-center justify-between px-4 md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <span data-testid="language-toggle" className="material-symbols-outlined text-primary cursor-pointer">
            language
          </span>
          <Link data-testid="logo-link" href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
              RIGIFY
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            data-testid="nav-home"
            href="/"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            data-testid="nav-browse"
            href="/businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-primary border-b border-primary pt-1"
          >
            Browse
          </Link>
          <Link
            data-testid="nav-my-bookings"
            href="/customer/dashboard"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            My Bookings
          </Link>
          <Link
            data-testid="nav-for-business"
            href="/for-businesses"
            className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium uppercase text-on-surface hover:text-primary transition-colors duration-200"
          >
            For Business
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full h-[353px] md:h-[442px] overflow-hidden flex flex-col justify-center px-4 md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1613145997165-cc9d0c847c5f?w=1920&h=800&fit=crop"
            alt="Tbilisi Architecture"
            fill
            className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-container mx-auto w-full">
          <span className="font-mono text-[12px] leading-[1] tracking-[0.3em] font-medium text-primary uppercase mb-4 block">
            Curated Excellence
          </span>
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold md:text-[64px] text-primary uppercase max-w-2xl">
            Beauty & Wellness <br />
            in Tbilisi
          </h1>
        </div>
      </header>

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
                data-testid="search-input"
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
              data-testid="district-select"
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
              data-testid="category-select"
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
            data-testid="discover-btn"
            className="bg-primary text-on-secondary px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-colors h-[50px] w-full md:w-auto"
          >
            Discover
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 md:px-margin-desktop py-12">
        <div className="max-w-container mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase tracking-tight">
                All Businesses
              </h2>
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-2">
                {loading ? "Loading..." : `Showing ${filteredBusinesses.length} of ${businesses.length}`}
              </p>
            </div>
          </div>

          {/* Business Grid */}
          {loading ? (
            <div className="text-center py-16">
              <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase">
                Loading businesses...
              </p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant uppercase">
                No businesses found matching your filters.
              </p>
            </div>
          ) : (
            <BusinessGrid businesses={filteredBusinesses} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-4 border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link data-testid="mobile-nav-browse" href="/businesses" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            search
          </span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link data-testid="mobile-nav-my-bookings" href="/customer/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Bookings
          </span>
        </Link>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Business
          </span>
        </Link>
      </nav>
    </div>
  );
}
