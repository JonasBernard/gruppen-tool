export const normalizeName = (name) => String(name ?? "").trim().toLowerCase();

export const sameName = (a, b) => normalizeName(a) === normalizeName(b);
