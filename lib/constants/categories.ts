export interface Category {
  id: string;
  ka: string;
  en: string;
  ru: string;
}

export const CATEGORIES: Category[] = [
  { id: "hair",    ka: "თმა",        en: "Hair",       ru: "Волосы"   },
  { id: "nails",   ka: "ფრჩხილები",  en: "Nails",      ru: "Ногти"    },
  { id: "skin",    ka: "კანი",       en: "Skin",       ru: "Кожа"     },
  { id: "massage", ka: "მასაჟი",     en: "Massage",    ru: "Массаж"   },
  { id: "brows",   ka: "წარბები",    en: "Brows",      ru: "Брови"    },
  { id: "makeup",  ka: "მაკიაჟი",    en: "Makeup",     ru: "Макияж"   },
  { id: "barber",  ka: "საბარბერო",  en: "Barbershop", ru: "Барбершоп" },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
