import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-4">
            Legal
          </p>
          <h1 data-testid="terms-title" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary mb-6">
            Terms of Service
          </h1>
          <p className="font-hanken text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Last updated: June 11, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <div data-testid="terms-toc" className="bg-surface-container border border-white/10 p-8 mb-12">
          <h2 className="font-hanken text-[20px] leading-[1.3] font-semibold text-white mb-4">
            Table of Contents
          </h2>
          <ol className="space-y-2">
            <li>
              <a href="#acceptance" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                1. Acceptance of Terms
              </a>
            </li>
            <li>
              <a href="#definitions" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                2. Definitions
              </a>
            </li>
            <li>
              <a href="#accounts" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                3. User Accounts
              </a>
            </li>
            <li>
              <a href="#booking" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                4. Booking and Appointments
              </a>
            </li>
            <li>
              <a href="#business" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                5. Business Accounts
              </a>
            </li>
            <li>
              <a href="#payments" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                6. Payments and Fees
              </a>
            </li>
            <li>
              <a href="#cancellations" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                7. Cancellations and Refunds
              </a>
            </li>
            <li>
              <a href="#conduct" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                8. User Conduct
              </a>
            </li>
            <li>
              <a href="#liability" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                9. Limitation of Liability
              </a>
            </li>
            <li>
              <a href="#termination" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                10. Termination
              </a>
            </li>
            <li>
              <a href="#changes" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                11. Changes to Terms
              </a>
            </li>
            <li>
              <a href="#contact" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                12. Contact Information
              </a>
            </li>
          </ol>
        </div>

        {/* 1. Acceptance */}
        <section id="acceptance" data-testid="terms-acceptance" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            1. Acceptance of Terms
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              By accessing or using Rigify ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              These terms apply to all users, including customers, business owners, and visitors.
            </p>
          </div>
        </section>

        {/* 2. Definitions */}
        <section id="definitions" data-testid="terms-definitions" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            2. Definitions
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">"Platform"</strong> refers to the Rigify website, mobile applications, and all related services.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">"Customer"</strong> refers to any individual booking appointments through the Platform.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">"Business"</strong> refers to salons, spas, clinics, and independent artisans offering services through the Platform.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">"Salome"</strong> refers to our AI-powered voice assistant for phone bookings.
            </p>
          </div>
        </section>

        {/* 3. Accounts */}
        <section id="accounts" data-testid="terms-accounts" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            3. User Accounts
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Customer Accounts:</strong> Customers may book as guests or create an account. Account holders can manage bookings, view history, and save preferences.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Business Accounts:</strong> Businesses must register and provide accurate information about their services, staff, and contact details.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              You must notify us immediately of any unauthorized access or security breaches.
            </p>
          </div>
        </section>

        {/* 4. Booking */}
        <section id="booking" data-testid="terms-booking" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            4. Booking and Appointments
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Booking Channels:</strong> Appointments can be made through the website, Salome voice assistant, or social media bots (Instagram, Facebook).
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Confirmation:</strong> All bookings are subject to business availability and confirmation. You will receive a confirmation via email and/or SMS.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Accuracy:</strong> Customers must provide accurate contact information. Rigify is not responsible for missed appointments due to incorrect contact details.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">No-Shows:</strong> Businesses may impose penalties or decline future bookings from customers who repeatedly fail to show up for confirmed appointments.
            </p>
          </div>
        </section>

        {/* 5. Business */}
        <section id="business" data-testid="terms-business" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            5. Business Accounts
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Listing Requirements:</strong> Businesses must provide accurate service descriptions, pricing, availability, and contact information.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Service Quality:</strong> Businesses are solely responsible for the quality and delivery of their services. Rigify is a booking platform and does not provide beauty or wellness services.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Salome Integration:</strong> Businesses using Salome AI agree to receive phone bookings through our voice assistant. Phone numbers are provided by Rigify and remain our property.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Reviews:</strong> Businesses may respond to customer reviews but may not manipulate, incentivize, or artificially inflate ratings.
            </p>
          </div>
        </section>

        {/* 6. Payments */}
        <section id="payments" data-testid="terms-payments" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            6. Payments and Fees
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Service Payment:</strong> Payment for services is typically handled directly between customers and businesses at the time of service. Some businesses may require deposits or accept online payments.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Platform Fees:</strong> Rigify may charge businesses subscription fees or commissions for platform usage. Current pricing is available at <a href="/for-businesses" className="text-primary hover:text-primary-container transition-colors">rigify.ge/for-businesses</a>.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Pricing Disputes:</strong> Customers should resolve pricing disputes directly with the business. Rigify does not mediate payment disputes.
            </p>
          </div>
        </section>

        {/* 7. Cancellations */}
        <section id="cancellations" data-testid="terms-cancellations" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            7. Cancellations and Refunds
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Customer Cancellations:</strong> Customers can cancel or reschedule appointments through their dashboard. Each business sets its own cancellation policy (e.g., 24-hour notice).
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Business Cancellations:</strong> Businesses may cancel appointments due to emergencies or unavailability. Affected customers will be notified immediately.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Refunds:</strong> Refund policies are determined by individual businesses. Rigify does not process refunds for services.
            </p>
          </div>
        </section>

        {/* 8. Conduct */}
        <section id="conduct" data-testid="terms-conduct" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            8. User Conduct
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-2">
              Users agree not to:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Provide false or misleading information
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Harass, abuse, or threaten other users or businesses
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Violate any laws or regulations
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Attempt to access unauthorized areas of the Platform
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Use automated systems (bots, scrapers) without permission
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Post fake reviews or manipulate ratings
              </li>
            </ul>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Violations may result in account suspension or termination.
            </p>
          </div>
        </section>

        {/* 9. Liability */}
        <section id="liability" data-testid="terms-liability" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            9. Limitation of Liability
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Platform Role:</strong> Rigify is a marketplace connecting customers with businesses. We do not provide beauty or wellness services and are not responsible for service quality, safety, or outcomes.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Business Responsibility:</strong> All services are provided by independent businesses. Disputes, injuries, damages, or dissatisfaction must be resolved directly with the business.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">No Warranties:</strong> The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or accuracy of listings.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Maximum Liability:</strong> To the fullest extent permitted by law, Rigify's liability is limited to the amount you paid to us in the past 12 months (if any).
            </p>
          </div>
        </section>

        {/* 10. Termination */}
        <section id="termination" data-testid="terms-termination" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            10. Termination
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              You may close your account at any time by contacting support. Outstanding bookings must be canceled before account closure.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Rigify reserves the right to suspend or terminate accounts for violations of these terms, fraudulent activity, or misuse of the Platform.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Upon termination, your access to the Platform will cease, but these terms will continue to apply to past transactions.
            </p>
          </div>
        </section>

        {/* 11. Changes */}
        <section id="changes" data-testid="terms-changes" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            11. Changes to Terms
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Rigify reserves the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last updated" date.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Continued use of the Platform after changes constitutes acceptance of the new terms.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              For significant changes, we will notify users via email or platform notification.
            </p>
          </div>
        </section>

        {/* 12. Contact */}
        <section id="contact" data-testid="terms-contact" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            12. Contact Information
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              For questions about these Terms of Service, please contact us:
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Email:</strong> <a href="mailto:support@rigify.ge" className="text-primary hover:text-primary-container transition-colors">support@rigify.ge</a>
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Address:</strong> Tbilisi, Georgia
            </p>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
