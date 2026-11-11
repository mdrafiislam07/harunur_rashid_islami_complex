// frontend/lib/teacherCategories.js
export const SITE_NAME = 'হারুনুর রশিদ ইসলামী কমপ্লেক্স';

export const CATEGORIES = [
  { key: 'principal',    label: 'প্রিন্সিপাল / চেয়ারম্যান',   short: 'প্রিন্সিপাল / চেয়ারম্যান', female: false },
  { key: 'ustaz',        label: 'উস্তায',                     short: 'উস্তায',                    female: false },
  { key: 'ustazah',      label: 'উস্তাযা ও মুকাররিরাহ',        short: 'উস্তাযা',                   female: true },
  { key: 'management',   label: 'ম্যানেজমেন্ট টিম (ভাই)',      short: 'ম্যানেজমেন্ট টিম',           female: false },
  { key: 'management_f', label: 'ম্যানেজমেন্ট টিম (বোন)',      short: 'ম্যানেজমেন্ট টিম',           female: true },
];

export const getCat = (k) => CATEGORIES.find((c) => c.key === k) || CATEGORIES[1];

const catIndex = (k) => {
  const i = CATEGORIES.findIndex((c) => c.key === k);
  return i === -1 ? 99 : i;
};

// category serial -> order -> creation time
export const sortTeachers = (list) =>
  [...list].sort(
    (a, b) =>
      catIndex(a.category) - catIndex(b.category) ||
      (a.order ?? 0) - (b.order ?? 0) ||
      new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );

// bio te jemon "&nbsp;" thake, oigulo poriskar kore
export const clean = (s = '') => String(s).replace(/&nbsp;/g, ' ').replace(/\s+\n/g, '\n').trim();