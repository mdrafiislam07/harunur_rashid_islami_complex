// গ্রেডিং নিয়ম (backend/studentRoutes.js এর সাথে একই): পাস মার্ক ৩৩%
export const point = (pct) =>
  pct >= 80 ? 5 : pct >= 70 ? 4 : pct >= 60 ? 3.5 : pct >= 50 ? 3 : pct >= 40 ? 2 : pct >= 33 ? 1 : 0;

export const letter = (g) =>
  g >= 5 ? 'A+' : g >= 4 ? 'A' : g >= 3.5 ? 'A-' : g >= 3 ? 'B' : g >= 2 ? 'C' : g >= 1 ? 'D' : 'F';

export const GRADE_SCALE = [
  ['৮০–১০০', 'A+', '৫.০০'],
  ['৭০–৭৯', 'A', '৪.০০'],
  ['৬০–৬৯', 'A-', '৩.৫০'],
  ['৫০–৫৯', 'B', '৩.০০'],
  ['৪০–৪৯', 'C', '২.০০'],
  ['৩৩–৩৯', 'D', '১.০০'],
  ['০–৩২', 'F', '০.০০'],
];

// ইংরেজি সংখ্যা -> বাংলা সংখ্যা
export const bn = (v) => String(v ?? '').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

export function subjectGrade(s) {
  if (s.absent) return { point: 0, letter: 'F' };
  const full = Number(s.full) > 0 ? Number(s.full) : 100;
  const p = point(((Number(s.marks) || 0) / full) * 100);
  return { point: p, letter: letter(p) };
}

// ফর্মে লাইভ প্রিভিউর জন্য
export function summarize(subjects) {
  const list = (subjects || []).filter((s) => s.name && String(s.name).trim());
  if (!list.length) return null;

  const rows = list.map((s) => ({
    full: Number(s.full) > 0 ? Number(s.full) : 100,
    marks: s.absent ? 0 : Math.max(0, Number(s.marks) || 0),
    point: subjectGrade(s).point,
  }));

  const totalFull = rows.reduce((a, x) => a + x.full, 0);
  const totalMarks = rows.reduce((a, x) => a + x.marks, 0);
  const failed = rows.some((x) => x.point === 0);
  const gpa = failed ? 0 : +(rows.reduce((a, x) => a + x.point, 0) / rows.length).toFixed(2);

  return {
    totalFull,
    totalMarks,
    percentage: +((totalMarks / totalFull) * 100).toFixed(2),
    gpa,
    grade: letter(gpa),
    passed: !failed,
  };
}
