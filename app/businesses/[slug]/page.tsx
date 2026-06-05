import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { getServerTranslations } from "@/lib/utils/server-translations";

export default async function BusinessProfilePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const { tr, lang } = getServerTranslations();
  const supabase = createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      slug,
      description,
      city,
      district,
      address,
      phone,
      email,
      website,
      instagram,
      cover_image_url,
      logo_url,
      rating,
      review_count,
      hours,
      business_categories (
        category_id
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!business) {
    notFound();
  }

  const [
    { data: services },
    { data: staff },
    { data: reviews }
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, price, duration_minutes, is_active")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("staff")
      .select("id, name, specialty, is_active")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        customers!inner (
          name
        )
      `)
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const normalizedReviews = reviews?.map(r => ({
    ...r,
    customers: Array.isArray(r.customers) ? r.customers[0] : r.customers
  }));

  const categoryLabels = business.business_categories
    .map((bc: { category_id: string }) => {
      const cat = CATEGORIES.find((c) => c.id === bc.category_id);
      return cat?.[lang];
    })
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link
            href="/businesses"
            className="label-mono hover:text-primary flex items-center gap-2"
          >
            {tr.businessProfile.back[lang]}
          </Link>
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <div className="flex items-center gap-stack-md">
            <Link href={`/businesses/${business.slug}/book`} className="btn-primary !py-2">
              {tr.businessProfile.bookNow[lang]}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="border-b border-outline-variant">
        <div className="mx-auto max-w-container">
          <div className="aspect-[21/9] bg-surface-container relative overflow-hidden">
            {business.cover_image_url ? (
              <img
                src={business.cover_image_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="font-mono text-data-label text-on-surface-variant uppercase tracking-wider">
                  {tr.businessProfile.noCoverImage[lang]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Header */}
      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg">
          <div className="flex items-start gap-gutter">
            {/* Logo */}
            {business.logo_url && (
              <div className="w-24 h-24 bg-background border border-outline-variant overflow-hidden flex-shrink-0">
                <img
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              {/* Categories */}
              {categoryLabels.length > 0 && (
                <p className="label-mono text-primary mb-stack-sm">
                  {categoryLabels.join(" · ").toUpperCase()}
                </p>
              )}

              <h1 className="text-display-md-mobile md:text-display-md mb-stack-sm">
                {business.name}
              </h1>

              {/* Rating */}
              {business.review_count > 0 ? (
                <p className="label-mono text-on-surface-variant mb-stack-md">
                  ★ {business.rating.toFixed(1)} · {business.review_count} {tr.businessProfile.reviews[lang]}
                </p>
              ) : (
                <p className="label-mono text-on-surface-variant mb-stack-md">
                  {tr.businessProfile.noReviews[lang]}
                </p>
              )}

              {/* Description */}
              {business.description && (
                <p className="text-body-lg text-on-surface-variant max-w-3xl">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-gutter">
            {/* Services */}
            <section className="border border-outline-variant bg-surface">
              <div className="px-gutter py-stack-lg border-b border-outline-variant">
                <h2 className="text-headline-lg">{tr.businessProfile.services[lang]}</h2>
              </div>

              {services && services.length > 0 ? (
                <div>
                  {services.map((service, index) => (
                    <div
                      key={service.id}
                      className={`px-gutter py-stack-md flex items-start justify-between ${
                        index < services.length - 1 ? "border-b border-outline-variant" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="text-headline-sm mb-stack-xs">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-body-md text-on-surface-variant">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-gutter">
                        <p className="text-headline-sm">₾{service.price}</p>
                        <p className="label-mono text-on-surface-variant">
                          {service.duration_minutes} {tr.businessProfile.min[lang]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-gutter py-section-gap text-center">
                  <p className="label-mono text-on-surface-variant">
                    {tr.businessProfile.noServices[lang]}
                  </p>
                </div>
              )}
            </section>

            {/* Staff */}
            {staff && staff.length > 0 && (
              <section className="border border-outline-variant bg-surface">
                <div className="px-gutter py-stack-lg border-b border-outline-variant">
                  <h2 className="text-headline-lg">{tr.businessProfile.ourTeam[lang]}</h2>
                </div>
                <div className="px-gutter py-stack-lg grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-start gap-stack-sm">
                      <div className="w-12 h-12 bg-surface-container flex items-center justify-center flex-shrink-0 font-mono text-headline-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-headline-sm">{member.name}</p>
                        {member.specialty && (
                          <p className="label-mono text-on-surface-variant">
                            {member.specialty.toUpperCase()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {normalizedReviews && normalizedReviews.length > 0 && (
              <section className="border border-outline-variant bg-surface">
                <div className="px-gutter py-stack-lg border-b border-outline-variant">
                  <h2 className="text-headline-lg">{tr.businessProfile.reviews[lang]}</h2>
                </div>
                <div>
                  {normalizedReviews.map((review, index) => (
                    <div
                      key={review.id}
                      className={`px-gutter py-stack-lg ${
                        index < normalizedReviews.length - 1 ? "border-b border-outline-variant" : ""
                      }`}
                    >
                      <div className="flex items-center gap-stack-sm mb-stack-sm">
                        <p className="label-mono text-on-surface">
                          {review.customers?.name || tr.businessProfile.anonymous[lang]}
                        </p>
                        <p className="label-mono text-primary">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-body-md text-on-surface-variant">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-gutter">
            {/* Book CTA */}
            <div className="border border-outline-variant bg-surface p-gutter">
              <p className="label-mono mb-stack-md">{tr.businessProfile.readyToBook[lang]}</p>
              <Link
                href={`/businesses/${business.slug}/book`}
                className="btn-primary w-full"
              >
                {tr.businessProfile.bookAppointment[lang]}
              </Link>
            </div>

            {/* Contact */}
            <div className="border border-outline-variant bg-surface p-gutter">
              <p className="label-mono mb-stack-md">{tr.businessProfile.contact[lang]}</p>
              <div className="space-y-stack-md text-body-md">
                <div>
                  <p className="label-mono text-on-surface-variant mb-stack-xs">
                    {tr.businessProfile.address[lang]}
                  </p>
                  <p className="text-on-surface">
                    {business.address}
                    <br />
                    {business.city}
                  </p>
                </div>

                {business.phone && (
                  <div>
                    <p className="label-mono text-on-surface-variant mb-stack-xs">
                      {tr.businessProfile.phone[lang]}
                    </p>
                    <a
                      href={`tel:${business.phone}`}
                      className="text-primary hover:underline"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}

                {business.email && (
                  <div>
                    <p className="label-mono text-on-surface-variant mb-stack-xs">
                      {tr.businessProfile.email[lang]}
                    </p>
                    <a
                      href={`mailto:${business.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {business.email}
                    </a>
                  </div>
                )}

                {business.instagram && (
                  <div>
                    <p className="label-mono text-on-surface-variant mb-stack-xs">
                      {tr.businessProfile.instagram[lang]}
                    </p>
                    <a
                      href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{business.instagram.replace("@", "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            {business.hours && (
              <div className="border border-outline-variant bg-surface p-gutter">
                <p className="label-mono mb-stack-md">{tr.businessProfile.hours[lang]}</p>
                <div className="space-y-stack-xs label-mono text-on-surface-variant">
                  {Object.entries(business.hours as Record<string, string>).map(
                    ([day, hours]) => (
                      <div key={day} className="flex justify-between gap-stack-sm">
                        <span className="uppercase">{day}</span>
                        <span>{hours}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-outline-variant mt-section-gap">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-stack-md text-on-surface-variant">
          <p className="label-mono">© {new Date().getFullYear()} RIGIFY</p>
          <p className="label-mono">RIGIFY.GE</p>
        </div>
      </footer>
    </main>
  );
}
