import { redirect } from "next/navigation";

/**
 * The standalone booking page has been replaced by the booking modal opened from
 * the business profile page. This route is kept only as a safety net so any old
 * link or bookmark redirects to the business page instead of 404'ing.
 */
export default function BookAppointmentPage({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/businesses/${params.slug}`);
}
