export interface Category {
  id: string;
  ka: string;
  en: string;
}

export const CATEGORIES: Category[] = [
  { id: "hair",    ka: "თმა",        en: "Hair"       },
  { id: "nails",   ka: "ფრჩხილები",  en: "Nails"      },
  { id: "skin",    ka: "კანი",       en: "Skin"       },
  { id: "massage", ka: "მასაჟი",     en: "Massage"    },
  { id: "brows",   ka: "წარბები",    en: "Brows"      },
  { id: "makeup",  ka: "მაკიაჟი",    en: "Makeup"     },
  { id: "barber",  ka: "საბარბერო",  en: "Barbershop" },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
