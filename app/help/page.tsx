import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import Link from "next/link";

export default function HelpPage() {
  const customerFAQs = [
    {
      question: "How do I book an appointment on Rigify?",
      answer: "Browse studios on the /businesses page, select a business, choose a service, pick your preferred date and time, and confirm your booking. You can book as a guest or create an account to manage your bookings."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes! Log in to your account, go to My Bookings, select the appointment, and choose to cancel or reschedule. Cancellation policies may vary by business."
    },
    {
      question: "Do I need to create an account to book?",
      answer: "No, you can book as a guest by providing your name, phone, and email. However, creating an account lets you manage all your bookings in one place and receive updates."
    },
    {
      question: "How do I contact the business directly?",
      answer: "Each business profile page includes contact information (phone number, address). You can also call their Salome AI assistant for instant booking support."
    },
    {
      question: "What payment methods are accepted?",
      answer: "Payment is typically handled at the business location after your service. Some businesses may require deposits or accept online payments — check the business profile for details."
    }
  ];

  const businessFAQs = [
    {
      question: "How do I list my business on Rigify?",
      answer: "Register for a business account at /register, complete your business profile with services, staff, and photos, and start accepting bookings immediately."
    },
    {
      question: "What is Salome AI and how does it work?",
      answer: "Salome is an AI-powered voice assistant that answers calls in Georgian, checks availability, and books appointments automatically. Enable it from your dashboard to handle bookings 24/7."
    },
    {
      question: "How do I manage my staff and services?",
      answer: "From your business dashboard, navigate to Services to add/edit offerings, and Staff to invite team members. Each staff member can have their own schedule and permissions."
    },
    {
      question: "Can I manually create bookings for walk-in customers?",
      answer: "Yes! Go to Appointments → Create New Appointment in your dashboard to manually add bookings for phone or walk-in customers."
    },
    {
      question: "How do I change my business hours or availability?",
      answer: "Update your availability in Dashboard → Settings. You can set business hours, holidays, and staff-specific schedules."
    }
  ];

  const bookingIssueFAQs = [
    {
      question: "What if my preferred time slot isn't available?",
      answer: "Try selecting a different staff member (if available) or a nearby time. You can also contact the business directly to request alternative times."
    },
    {
      question: "I didn't receive a booking confirmation email. What should I do?",
      answer: "Check your spam folder first. Then log in to your account to verify the booking was created. If issues persist, contact the business directly or reach out to support@rigify.ge."
    },
    {
      question: "The business canceled my appointment. What are my options?",
      answer: "You'll receive a notification if a business cancels. You can rebook with the same business or browse other studios. If you experience repeated cancellations, contact our support team."
    },
    {
      question: "Can I book multiple services in one appointment?",
      answer: "This depends on the business. Some allow multi-service bookings in a single time slot. Check the business profile or contact them directly for details."
    }
  ];

  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-4">
            Help & Support
          </p>
          <h1 data-testid="help-title" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary mb-6">
            How Can We Help?
          </h1>
          <p className="font-hanken text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Find answers to common questions about booking, managing appointments, and using Rigify.
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-12">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[20px]">
              search
            </span>
            <input
              data-testid="help-search-input"
              type="text"
              placeholder="Search for help..."
              className="w-full bg-surface-container border border-white/10 focus:border-primary pl-14 pr-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[16px] leading-[1.5]"
            />
          </div>
        </div>

        {/* For Customers */}
        <section data-testid="help-customers" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">person</span>
            For Customers
          </h2>
          <FAQAccordion items={customerFAQs} category="customers" />
        </section>

        {/* For Businesses */}
        <section data-testid="help-businesses" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">storefront</span>
            For Businesses
          </h2>
          <FAQAccordion items={businessFAQs} category="businesses" />
        </section>

        {/* Booking Issues */}
        <section data-testid="help-booking-issues" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px]">event_busy</span>
            Booking Issues
          </h2>
          <FAQAccordion items={bookingIssueFAQs} category="booking-issues" />
        </section>

        {/* Still Need Help */}
        <div className="bg-surface-container border border-primary/30 p-8 text-center">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4 block">
            support_agent
          </span>
          <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-3">
            Still Need Help?
          </h2>
          <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-6">
            Our support team is here to assist you with any questions or issues.
          </p>
          <Link
            data-testid="help-contact-cta"
            href="/contact"
            className="inline-block bg-primary text-on-primary px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
