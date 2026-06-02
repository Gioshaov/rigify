import Link from "next/link";
import { loginAction } from "./actions";
import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <main className="min-h-screen flex items-stretch">
      <div className="hidden md:flex w-1/2 bg-surface border-r border-outline-variant flex-col justify-between p-margin-desktop">
        <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
          RIGIFY
        </Link>
        <div>
          <p className="label-mono mb-stack-md">FOR BUSINESS</p>
          <h2 className="text-headline-md max-w-md">
            Run your salon&rsquo;s entire booking flow — web, voice and DM — from one place.
          </h2>
        </div>
        <p className="label-mono text-on-surface-variant">© RIGIFY · Tbilisi</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-margin-desktop">
        <div className="w-full max-w-md">
          <p className="label-mono text-primary mb-stack-md">SIGN IN</p>
          <h1 className="text-display-lg-mobile md:text-headline-md">Welcome back.</h1>
          <p className="mt-stack-md text-on-surface-variant">
            New here?{" "}
            <Link href="/customer-register" className="text-primary hover:underline">
              Register as a Customer
            </Link>
            .
          </p>

          <LoginForm action={loginAction} redirectTo={searchParams.redirect} />
        </div>
      </div>
    </main>
  );
}
