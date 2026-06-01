export interface City {
  id: string;
  ka: string;
  en: string;
  ru: string;
}

export const CITIES: City[] = [
  { id: "tbilisi", ka: "თბილისი", en: "Tbilisi", ru: "Тбилиси" },
  { id: "batumi",  ka: "ბათუმი",  en: "Batumi",  ru: "Батуми"  },
  { id: "kutaisi", ka: "ქუთაისი", en: "Kutaisi", ru: "Кутаиси" },
  { id: "rustavi", ka: "რუსთავი", en: "Rustavi", ru: "Рустави" },
];

export const CITY_IDS = CITIES.map((c) => c.id);
