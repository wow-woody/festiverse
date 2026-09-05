const HANGUL_INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const INITIAL_INTERVAL = 588;

export const normalizeText = (value: string): string => value.toLowerCase().replace(/\s+/g, '');

export const toInitials = (value: string): string => {
  let result = '';

  for (const character of value) {
    const code = character.charCodeAt(0);

    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const index = Math.floor((code - HANGUL_BASE) / INITIAL_INTERVAL);
      result += HANGUL_INITIALS[index] ?? character;
      continue;
    }

    if (/\s/.test(character)) {
      continue;
    }

    result += character.toLowerCase();
  }

  return result;
};

const toWordInitials = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => toInitials(word)[0] ?? '')
    .join('');

export type SearchIndex = {
  normalizedCombined: string;
  initialsCombined: string;
  titleInitials: string;
  locationInitials: string;
  titleWordInitials: string;
  locationWordInitials: string;
};

export const buildSearchIndex = (title: string, location: string, date: string, dday: string): SearchIndex => {
  const titleInitials = toInitials(title);
  const locationInitials = toInitials(location);
  const titleWordInitials = toWordInitials(title);
  const locationWordInitials = toWordInitials(location);
  const combined = [title, location, date, dday, titleInitials, locationInitials].filter(Boolean).join(' ');

  return {
    normalizedCombined: normalizeText(combined),
    initialsCombined: toInitials(combined),
    titleInitials,
    locationInitials,
    titleWordInitials,
    locationWordInitials,
  };
};

export const matchesQuery = (index: SearchIndex, query: string): boolean => {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery === '') {
    return true;
  }

  const queryInitials = toInitials(query);

  return (
    index.normalizedCombined.includes(normalizedQuery) ||
    index.initialsCombined.includes(queryInitials) ||
    index.initialsCombined.includes(normalizedQuery) ||
    index.titleInitials.includes(queryInitials) ||
    index.locationInitials.includes(queryInitials) ||
    index.titleWordInitials.includes(queryInitials) ||
    index.locationWordInitials.includes(queryInitials)
  );
};
