import Link from "next/link";
import { customerRegisterAction } from "./actions";
import { CustomerRegisterForm } from "./CustomerRegisterForm";

export default function CustomerRegisterPage() {
  return (
    <main className="min-h-screen flex items-stretch">
      <div className="hidden md:flex w-1/2 bg-surface border-r border-outline-variant flex-col justify-between p-margin-desktop">
        <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
          RIGIFY
        </Link>
        <div>
          <p className="label-mono mb-stack-md">CREATE ACCOUNT</p>
          <h2 className="text-headline-md max-w-md">
            Book appointments, track your history, and never miss a session.
          </h2>
          <ul className="mt-stack-lg space-y-stack-sm text-on-surface-variant">
            <li>· View all your upcoming bookings</li>
            <li>· Access booking history</li>
            <li>· Manage your profile</li>
          </ul>
        </div>
        <p className="label-mono text-on-surface-variant">© RIGIFY · Tbilisi</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="w-full max-w-md">
          <p className="label-mono text-primary mb-stack-md">CUSTOMER ACCOUNT</p>
          <h1 className="text-display-lg-mobile md:text-headline-md">Create your account.</h1>
          <p className="mt-stack-md text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
            .
          </p>
          <p className="mt-stack-sm text-on-surface-variant text-sm">
            Are you a business owner?{" "}
            <Link href="/for-businesses" className="text-primary hover:underline">
              For Businesses
            </Link>
            .
          </p>

          <CustomerRegisterForm action={customerRegisterAction} />
        </div>
      </div>
    </main>
  );
}
