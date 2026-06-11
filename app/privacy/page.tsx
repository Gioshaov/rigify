import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-4">
            Legal
          </p>
          <h1 data-testid="privacy-title" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary mb-6">
            Privacy Policy
          </h1>
          <p className="font-hanken text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Last updated: June 11, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <div data-testid="privacy-toc" className="bg-surface-container border border-white/10 p-8 mb-12">
          <h2 className="font-hanken text-[20px] leading-[1.3] font-semibold text-white mb-4">
            Table of Contents
          </h2>
          <ol className="space-y-2">
            <li>
              <a href="#introduction" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                1. Introduction
              </a>
            </li>
            <li>
              <a href="#data-collected" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                2. Data We Collect
              </a>
            </li>
            <li>
              <a href="#how-we-use" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                3. How We Use Your Data
              </a>
            </li>
            <li>
              <a href="#data-sharing" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                4. Data Sharing and Disclosure
              </a>
            </li>
            <li>
              <a href="#cookies" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                5. Cookies and Tracking
              </a>
            </li>
            <li>
              <a href="#data-security" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                6. Data Security
              </a>
            </li>
            <li>
              <a href="#your-rights" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                7. Your Rights
              </a>
            </li>
            <li>
              <a href="#data-retention" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                8. Data Retention
              </a>
            </li>
            <li>
              <a href="#children" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                9. Children's Privacy
              </a>
            </li>
            <li>
              <a href="#international" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                10. International Data Transfers
              </a>
            </li>
            <li>
              <a href="#changes" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                11. Changes to This Policy
              </a>
            </li>
            <li>
              <a href="#contact" className="font-hanken text-[14px] leading-[1.6] text-primary hover:text-primary-container transition-colors">
                12. Contact Us
              </a>
            </li>
          </ol>
        </div>

        {/* 1. Introduction */}
        <section id="introduction" data-testid="privacy-introduction" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            1. Introduction
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Rigify ("we", "our", "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our Platform.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              This policy applies to all users: customers (both registered and guests), business owners, and visitors.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              By using Rigify, you consent to the data practices described in this policy.
            </p>
          </div>
        </section>

        {/* 2. Data Collected */}
        <section id="data-collected" data-testid="privacy-data-collected" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            2. Data We Collect
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Account Information:</strong> When you register, we collect your name, email address, phone number, and password.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Booking Information:</strong> When you book an appointment, we collect your name, phone number, email (optional for guests), service details, date/time preferences, and any notes you provide.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Business Information:</strong> Business owners provide business name, address, services, staff details, pricing, availability, and contact information.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Voice Data:</strong> When you use Salome (our AI voice assistant), we record and process your voice to complete bookings. Recordings are stored temporarily and deleted after 30 days.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Usage Data:</strong> We collect information about how you interact with the Platform, including pages visited, features used, browser type, IP address, device information, and timestamps.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Location Data:</strong> With your permission, we may collect location data to show nearby businesses and services.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Communications:</strong> We store messages you send through our contact form, support tickets, and reviews.
            </p>
          </div>
        </section>

        {/* 3. How We Use */}
        <section id="how-we-use" data-testid="privacy-how-we-use" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            3. How We Use Your Data
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-2">
              We use your personal data to:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Facilitate booking and appointment management
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Send booking confirmations, reminders, and updates via email/SMS
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Provide customer support and respond to inquiries
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Process payments and prevent fraud
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Improve and personalize your experience on the Platform
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Analyze usage patterns and Platform performance
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Send promotional offers and updates (you can opt out at any time)
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Comply with legal obligations and enforce our Terms of Service
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Data Sharing */}
        <section id="data-sharing" data-testid="privacy-data-sharing" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            4. Data Sharing and Disclosure
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">With Businesses:</strong> When you book an appointment, we share your name, phone number, and booking details with the business to fulfill your appointment.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Service Providers:</strong> We use third-party services (hosting, email, SMS, analytics) to operate the Platform. These providers have access to your data only to perform services on our behalf.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Legal Requirements:</strong> We may disclose your information if required by law, court order, or government request.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Business Transfers:</strong> If Rigify is acquired or merged, your data may be transferred to the new owner.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Public Information:</strong> Business profiles, reviews, and ratings are publicly visible on the Platform.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              We do not sell your personal data to third parties.
            </p>
          </div>
        </section>

        {/* 5. Cookies */}
        <section id="cookies" data-testid="privacy-cookies" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            5. Cookies and Tracking
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Rigify uses cookies and similar tracking technologies to provide and improve our services.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Essential Cookies:</strong> Required for login, session management, and core Platform functionality.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Analytics Cookies:</strong> Help us understand how users interact with the Platform (e.g., Google Analytics).
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Marketing Cookies:</strong> Used to deliver personalized ads and measure campaign effectiveness.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              You can control cookies through your browser settings. Disabling essential cookies may affect Platform functionality.
            </p>
          </div>
        </section>

        {/* 6. Data Security */}
        <section id="data-security" data-testid="privacy-data-security" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            6. Data Security
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              We implement industry-standard security measures to protect your personal data:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Encryption of data in transit (HTTPS/TLS)
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Secure password hashing (bcrypt)
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Role-based access controls (RLS policies)
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Regular security audits and monitoring
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                Secure cloud infrastructure (Supabase, Vercel)
              </li>
            </ul>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              However, no system is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* 7. Your Rights */}
        <section id="your-rights" data-testid="privacy-your-rights" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            7. Your Rights
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-2">
              You have the following rights regarding your personal data:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Access:</strong> Request a copy of your personal data
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Correction:</strong> Update inaccurate or incomplete information
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Deletion:</strong> Request deletion of your account and data (subject to legal retention requirements)
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Portability:</strong> Receive your data in a machine-readable format
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Objection:</strong> Opt out of marketing communications
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Withdrawal of Consent:</strong> Withdraw consent for data processing (may affect Platform functionality)
              </li>
            </ul>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              To exercise these rights, contact us at <a href="mailto:support@rigify.ge" className="text-primary hover:text-primary-container transition-colors">support@rigify.ge</a>. We will respond within 30 days.
            </p>
          </div>
        </section>

        {/* 8. Data Retention */}
        <section id="data-retention" data-testid="privacy-data-retention" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            8. Data Retention
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              We retain your personal data for as long as necessary to provide services and comply with legal obligations:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Active Accounts:</strong> Data retained while your account is active
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Booking History:</strong> Retained for 3 years for business records and dispute resolution
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Voice Recordings:</strong> Deleted after 30 days
              </li>
              <li className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant list-disc">
                <strong className="text-white">Marketing Data:</strong> Deleted immediately upon opt-out
              </li>
            </ul>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              After account deletion, we may retain anonymized data for analytics and aggregated reporting.
            </p>
          </div>
        </section>

        {/* 9. Children */}
        <section id="children" data-testid="privacy-children" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            9. Children's Privacy
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Rigify is not intended for users under 18 years of age. We do not knowingly collect personal data from children.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              If we discover that we have collected data from a child without parental consent, we will delete it immediately.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              If you believe a child has provided us with personal information, please contact us at <a href="mailto:support@rigify.ge" className="text-primary hover:text-primary-container transition-colors">support@rigify.ge</a>.
            </p>
          </div>
        </section>

        {/* 10. International */}
        <section id="international" data-testid="privacy-international" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            10. International Data Transfers
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Rigify operates primarily in Georgia, but our service providers (hosting, analytics) may be located in other countries.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              By using the Platform, you consent to the transfer of your data to countries outside Georgia, including the United States and European Union, where data protection laws may differ.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              We ensure that all international data transfers comply with applicable privacy laws and are protected by appropriate safeguards (e.g., standard contractual clauses).
            </p>
          </div>
        </section>

        {/* 11. Changes */}
        <section id="changes" data-testid="privacy-changes" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            11. Changes to This Policy
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              For significant changes, we will notify you via email or platform notification.
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              Continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* 12. Contact */}
        <section id="contact" data-testid="privacy-contact" className="mb-12">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            12. Contact Us
          </h2>
          <div className="bg-surface-container border border-white/10 p-6 space-y-4">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              For questions, concerns, or requests related to this Privacy Policy or your personal data, please contact us:
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Email:</strong> <a href="mailto:support@rigify.ge" className="text-primary hover:text-primary-container transition-colors">support@rigify.ge</a>
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              <strong className="text-white">Address:</strong> Tbilisi, Georgia
            </p>
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
              We will respond to all privacy inquiries within 30 days.
            </p>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
