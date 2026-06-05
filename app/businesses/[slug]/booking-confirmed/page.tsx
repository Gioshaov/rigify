import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookingConfirmationClient } from "./BookingConfirmationClient";

type PageProps = {
  params: { slug: string };
  searchParams: { id?: string };
};

export default async function BookingConfirmedPage({ params, searchParams }: PageProps) {
  const bookingId = searchParams.id;

  if (!bookingId) {
    notFound();
  }

  // Use admin client to bypass RLS - booking confirmation needs to work for guests
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      services (
        name,
        duration_minutes,
        price
      ),
      staff (
        name
      ),
      businesses (
        name,
        slug,
        phone,
        address,
        city
      )
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    notFound();
  }

  return <BookingConfirmationClient booking={booking as any} />;
}
