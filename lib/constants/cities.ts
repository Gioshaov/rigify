export interface City {
  id: string;
  ka: string;
  en: string;
}

export const CITIES: City[] = [
  { id: "tbilisi", ka: "თბილისი", en: "Tbilisi" },
  { id: "batumi",  ka: "ბათუმი",  en: "Batumi"  },
  { id: "kutaisi", ka: "ქუთაისი", en: "Kutaisi" },
  { id: "rustavi", ka: "რუსთავი", en: "Rustavi" },
];

export const CITY_IDS = CITIES.map((c) => c.id);
