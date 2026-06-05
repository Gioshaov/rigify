// Major districts in Tbilisi
export const TBILISI_DISTRICTS = [
  { id: 'vake', en: 'Vake', ka: 'ვაკე' },
  { id: 'saburtalo', en: 'Saburtalo', ka: 'საბურთალო' },
  { id: 'didi-digomi', en: 'Didi Digomi', ka: 'დიდი დიღომი' },
  { id: 'varketili', en: 'Varketili', ka: 'ვარკეთილი' },
  { id: 'gldani', en: 'Gldani', ka: 'გლდანი' },
  { id: 'isani', en: 'Isani', ka: 'ისანი' },
  { id: 'samgori', en: 'Samgori', ka: 'სამგორი' },
  { id: 'didube', en: 'Didube', ka: 'დიდუბე' },
  { id: 'chugureti', en: 'Chugureti', ka: 'ჩუღურეთი' },
  { id: 'krtsanisi', en: 'Krtsanisi', ka: 'კრწანისი' },
  { id: 'mtatsminda', en: 'Mtatsminda', ka: 'მთაწმინდა' },
  { id: 'nadzaladevi', en: 'Nadzaladevi', ka: 'ნაძალადევი' },
  { id: 'vashlijvari', en: 'Vashlijvari', ka: 'ვაშლიჯვარი' },
] as const;

// Helper function to normalize district names for comparison
export function normalizeDistrict(district: string | null): string | null {
  if (!district) return null;

  const normalized = district.toLowerCase().trim();

  // Find matching district
  const match = TBILISI_DISTRICTS.find(
    d => d.en.toLowerCase() === normalized ||
         d.ka === district.trim() ||
         d.id === normalized
  );

  return match ? match.en : district;
}
