import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ContactForm } from "@/components/marketing/ContactForm";

export default function ContactPage() {
  return (
    <MarketingLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-4">
            Get In Touch
          </p>
          <h1 data-testid="contact-title" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary mb-6">
            Contact Us
          </h1>
          <p className="font-hanken text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Have a question, feedback, or need support? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-6">
              Other Ways to Reach Us
            </h2>

            {/* Email */}
            <div data-testid="contact-email" className="bg-surface-container border border-white/10 p-6 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">mail</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Email
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant mb-2">
                For general inquiries and support
              </p>
              <a
                data-testid="contact-email-link"
                href="mailto:support@rigify.ge"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-primary hover:text-primary-container transition-colors uppercase"
              >
                support@rigify.ge
              </a>
            </div>

            {/* Phone */}
            <div data-testid="contact-phone" className="bg-surface-container border border-white/10 p-6 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">phone</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Phone
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant mb-2">
                Monday - Friday, 9:00 AM - 6:00 PM (GMT+4)
              </p>
              <p
                data-testid="contact-phone-link"
                className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-on-surface-variant uppercase"
              >
                +995 XXX XXX XXX (Coming Soon)
              </p>
            </div>

            {/* Social Media */}
            <div data-testid="contact-social" className="bg-surface-container border border-white/10 p-6 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">share</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Social Media
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant mb-4">
                Follow us for updates and beauty inspiration
              </p>
              <div className="flex items-center gap-4">
                <a
                  data-testid="contact-instagram-link"
                  href="https://instagram.com/rigify.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[32px]">photo_camera</span>
                </a>
                <a
                  data-testid="contact-facebook-link"
                  href="https://facebook.com/rigify.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[32px]">public</span>
                </a>
              </div>
            </div>

            {/* Office */}
            <div data-testid="contact-office" className="bg-surface-container border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Office
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                Tbilisi, Georgia
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
