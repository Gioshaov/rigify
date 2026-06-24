import { notFound } from "next/navigation";
import { getBookingConfirmation } from "@/lib/bookings/get-confirmation";
import { BookingConfirmationClient } from "./BookingConfirmationClient";

type PageProps = {
  params: { slug: string };
  searchParams: { id?: string };
};

export default async function BookingConfirmedPage({ searchParams }: PageProps) {
  const result = await getBookingConfirmation(searchParams.id);

  if (!result) {
    notFound();
  }

  return <BookingConfirmationClient booking={result.booking} canViewPII={result.canViewPII} />;
}
