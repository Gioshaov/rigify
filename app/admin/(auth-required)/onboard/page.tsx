import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import OnboardForm from './OnboardForm';

export default async function OnboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      <AdminSidebar />

      <main className="flex-1 ml-60 overflow-y-auto pb-12">
        <AdminTopBar
          title="Onboard New Business"
          subtitle="Create business record, owner login, and optional staff account"
        />

        <div className="px-8 py-6 max-w-5xl">
          <OnboardForm />
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-0 left-60 right-0 h-8 bg-[#0a0a0a] border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-2">
            <div className="w-[5px] h-[5px] rounded-full bg-green-500" />
            <span className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
              System Operational
            </span>
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            API V2.4.8-GOLD
          </div>
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Last Updated: {new Date().toUTCString().split(' ')[4]} GMT
          </div>
        </div>
      </main>
    </div>
  );
}
