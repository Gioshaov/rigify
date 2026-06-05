'use client'

import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookingForm } from "./BookingForm";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslations } from "@/lib/hooks/useTranslations";

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { tr, lang } = useTranslations();

  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // Fetch business
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (businessError || !businessData) {
        setLoading(false);
        return;
      }

      setBusiness(businessData);

      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessData.id)
        .eq("is_active", true)
        .order("name");

      setServices(servicesData || []);

      // Fetch staff
      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .eq("business_id", businessData.id)
        .eq("is_active", true)
        .order("name");

      setStaff(staffData || []);

      // Get customer info if logged in
      if (user) {
        const { data: customer } = await supabase
          .from("customers")
          .select("name, phone, email")
          .eq("id", user.id)
          .single();

        setCustomerInfo(customer);
      }

      setLoading(false);
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="label-mono">{tr.common.loading[lang]}</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="label-mono">Business not found</p>
      </main>
    );
  }

  // Check if we have services
  if (services.length === 0) {
    return (
      <main className="min-h-screen bg-background text-on-surface">
        <header className="border-b border-outline-variant">
          <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
            <Link
              href={`/businesses/${business.slug}`}
              className="label-mono hover:text-primary flex items-center gap-2"
            >
              {tr.bookingPage.back[lang]}
            </Link>
            <div className="flex items-center gap-stack-md">
              <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
                RIGIFY
              </Link>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="border border-outline-variant bg-surface p-gutter text-center">
            <p className="label-mono text-on-surface-variant mb-stack-md">
              {tr.bookingPage.noServicesAvailable[lang]}
            </p>
            <p className="text-body-lg text-on-surface-variant mb-stack-lg">
              {tr.bookingPage.noServicesMessage[lang]}
            </p>
            <Link href={`/businesses/${business.slug}`} className="btn-secondary">
              {tr.bookingPage.goBack[lang]}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link
            href={`/businesses/${business.slug}`}
            className="label-mono hover:text-primary flex items-center gap-2"
          >
            {tr.bookingPage.back[lang]}
          </Link>
          <div className="flex items-center gap-stack-md">
            <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
              RIGIFY
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="mb-stack-lg">
          <h1 className="text-display-md mb-stack-sm">{tr.bookingPage.bookAppointment[lang]}</h1>
          <p className="text-headline-sm text-on-surface-variant">{business.name}</p>
        </div>

        <BookingForm
          businessId={business.id}
          businessSlug={business.slug}
          services={services}
          staff={staff}
          customerInfo={customerInfo}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </main>
  );
}
