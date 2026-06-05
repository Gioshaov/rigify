'use client'

import { createClient } from "@/lib/supabase/client";
import { CustomerProfileForm } from "./CustomerProfileForm";
import { updateCustomerProfileAction } from "./actions";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/hooks/useTranslations";

export default function CustomerProfilePage() {
  const { tr, lang } = useTranslations();
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      setCustomer(customerData);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section>
        <p className="text-on-surface-variant">{tr.common.loading[lang]}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h1 className="text-headline-md">{tr.customerDashboard.pleaseSignIn[lang]}</h1>
      </section>
    );
  }

  if (!customer) {
    return (
      <section>
        <h1 className="text-headline-md">{tr.customerDashboard.profileNotFound[lang]}</h1>
      </section>
    );
  }

  return (
    <section className="max-w-2xl">
      <div>
        <h1 className="text-headline-md">{tr.customerDashboard.profile[lang]}</h1>
        <p className="mt-stack-sm text-on-surface-variant">
          {tr.customerDashboard.managePersonalInfo[lang]}
        </p>
      </div>

      <CustomerProfileForm action={updateCustomerProfileAction} customer={customer} />
    </section>
  );
}
