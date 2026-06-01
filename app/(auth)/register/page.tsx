import Link from "next/link";
import { registerAction } from "./actions";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-stretch">
      <div className="hidden md:flex w-1/2 bg-surface border-r border-outline-variant flex-col justify-between p-margin-desktop">
        <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
          RIGIFY
        </Link>
        <div>
          <p className="label-mono mb-stack-md">LIST YOUR BUSINESS</p>
          <h2 className="text-headline-md max-w-md">
            Replace WhatsApp, Google Calendar, and your missed-call list — in one trial month.
          </h2>
          <ul className="mt-stack-lg space-y-stack-sm text-on-surface-variant">
            <li>· Public booking page on rigify.ge</li>
            <li>· Salome AI voice receptionist add-on</li>
            <li>· Georgian / English / Russian out of the box</li>
          </ul>
        </div>
        <p className="label-mono text-on-surface-variant">© RIGIFY · Tbilisi</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="w-full max-w-md">
          <p className="label-mono text-primary mb-stack-md">REGISTER</p>
          <h1 className="text-display-lg-mobile md:text-headline-md">Open your studio on Rigify.</h1>
          <p className="mt-stack-md text-on-surface-variant">
            Already on Rigify?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
            .
          </p>

          <RegisterForm action={registerAction} />
        </div>
      </div>
    </main>
  );
}
