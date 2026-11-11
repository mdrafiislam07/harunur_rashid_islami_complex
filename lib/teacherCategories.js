// frontend/lib/teacherCategories.js
export const SITE_NAME = 'হারুনুর রশিদ ইসলামী কমপ্লেক্স';

// Purano fixed category (ager teacher der database e key hishabe ache).
// Notun category admin nije likhbe, tai ei list ekhon shudhu purano data er jonno.
export const CATEGORIES = [
  { key: 'principal',    label: 'প্রিন্সিপাল / চেয়ারম্যান',   short: 'প্রিন্সিপাল / চেয়ারম্যান', female: false },
  { key: 'ustaz',        label: 'উস্তায',                     short: 'উস্তায',                    female: false },
  { key: 'ustazah',      label: 'উস্তাযা ও মুকাররিরাহ',        short: 'উস্তাযা',                   female: true },
  { key: 'management',   label: 'ম্যানেজমেন্ট টিম (ভাই)',      short: 'ম্যানেজমেন্ট টিম',           female: false },
  { key: 'management_f', label: 'ম্যানেজমেন্ট টিম (বোন)',      short: 'ম্যানেজমেন্ট টিম',           female: true },
];

const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ');

// category (purano key ba admin er lekha naam) -> dekhanor naam
export const catLabel = (c) => {
  const s = norm(c);
  const legacy = CATEGORIES.find((x) => x.key === s);
  return legacy ? legacy.label : s || CATEGORIES[1].label;
};

export const getCat = (k) => {
  const legacy = CATEGORIES.find((c) => c.key === norm(k));
  if (legacy) return legacy;
  const label = catLabel(k);
  return { key: label, label, short: label, female: false };
};

// default icon male na female
export const isFemale = (t) =>
  typeof t?.female === 'boolean' ? t.female : !!getCat(t?.category).female;

const rank = (c) => {
  const i = CATEGORIES.findIndex((x) => x.key === norm(c));
  return i === -1 ? 99 : i;
};

// serial: 1,2,3... (khali / 0 = serial dewa hoyni, sheshe jabe)
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 9999;
};
const time = (t) => new Date(t?.createdAt || 0).getTime();

// [{ key, label, items }]
// section er position = oi section er sobcheye choto serial
// section er bhetore = serial -> creation time
export function groupTeachers(list) {
  const map = new Map();
  for (const t of list || []) {
    const label = catLabel(t.category);
    const k = label.toLowerCase();
    if (!map.has(k)) map.set(k, { key: label, label, items: [] });
    map.get(k).items.push(t);
  }
  const groups = [...map.values()];
  for (const g of groups) {
    g.items.sort((a, b) => num(a.order) - num(b.order) || time(a) - time(b));
    g.minOrder = num(g.items[0].order);
    g.rank = Math.min(...g.items.map((t) => rank(t.category)));
    g.first = Math.min(...g.items.map(time));
  }
  groups.sort((a, b) => a.minOrder - b.minOrder || a.rank - b.rank || a.first - b.first);
  return groups;
}

export const sortTeachers = (list) => groupTeachers(list).flatMap((g) => g.items);

// bio te jemon "&nbsp;" thake, oigulo poriskar kore
export const clean = (s = '') => String(s).replace(/&nbsp;/g, ' ').replace(/\s+\n/g, '\n').trim();