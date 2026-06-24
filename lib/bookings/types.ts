/** Shape of the data the booking-confirmation UI needs (page + modal). */
export type BookingConfirmationData = {
  id: string;
  appointment_datetime: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string | null;
  price: number | null;
  services: {
    name: string;
    duration_minutes: number;
    price_min: number;
    price_max: number;
  };
  staff: {
    name: string;
  } | null;
  businesses: {
    name: string;
    slug: string;
    phone: string | null;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };
};
