import { ApiError } from '@/api/client';
import { COUNTRIES_API_KEY, COUNTRIES_API_URL, REQUEST_TIMEOUT_MS } from '@/config';

/**
 * Client for the third-party REST Countries v5 API.
 *
 * Kept separate from client.ts on purpose: that one speaks our PHP envelope
 * ({ success, data }), this one speaks REST Countries' ({ data: { objects } })
 * and needs a bearer key.
 */

/** A country, flattened to just what the screens render. */
export type Country = {
  name: string;
  officialName: string;
  /** ISO alpha-2, e.g. "BR". Stable key for lists. */
  code: string;
  /** FIFA trigramme, e.g. "BRA". Missing for a few territories. */
  fifa: string | null;
  flagUrl: string;
  flagEmoji: string;
  capital: string | null;
  region: string;
  subregion: string | null;
  population: number;
  areaKm: number | null;
  languages: string[];
  currencies: { code: string; name: string; symbol: string | null }[];
  timezones: string[];
};

/** The subset of the v5 response shape we ask for with response_fields. */
type RawCountry = {
  names?: { common?: string; official?: string };
  codes?: { alpha_2?: string; fifa?: string };
  flag?: { emoji?: string; url_png?: string };
  capitals?: { name?: string; attributes?: { primary?: boolean } }[];
  region?: string;
  subregion?: string;
  population?: number;
  area?: { kilometers?: number };
  languages?: { name?: string }[];
  currencies?: { code?: string; name?: string; symbol?: string }[];
  timezones?: string[];
};

type RawEnvelope = {
  data?: { objects?: RawCountry[]; _demo?: unknown };
  errors?: { message?: string; code?: string }[];
};

/** Only these fields come back, which keeps each response a few KB. */
const RESPONSE_FIELDS = [
  'names.common',
  'names.official',
  'codes.alpha_2',
  'codes.fifa',
  'flag.emoji',
  'flag.url_png',
  'capitals',
  'region',
  'subregion',
  'population',
  'area.kilometers',
  'languages',
  'currencies',
  'timezones',
].join(',');

function toCountry(raw: RawCountry): Country {
  const capitals = raw.capitals ?? [];
  const capital = capitals.find((c) => c.attributes?.primary) ?? capitals[0];

  return {
    name: raw.names?.common ?? 'Unknown',
    officialName: raw.names?.official ?? raw.names?.common ?? 'Unknown',
    code: raw.codes?.alpha_2 ?? raw.names?.common ?? '??',
    fifa: raw.codes?.fifa ?? null,
    flagUrl: raw.flag?.url_png ?? '',
    flagEmoji: raw.flag?.emoji ?? '',
    capital: capital?.name ?? null,
    region: raw.region ?? '—',
    subregion: raw.subregion ?? null,
    population: raw.population ?? 0,
    areaKm: raw.area?.kilometers ?? null,
    languages: (raw.languages ?? []).map((l) => l.name ?? '').filter(Boolean),
    currencies: (raw.currencies ?? []).map((c) => ({
      code: c.code ?? '',
      name: c.name ?? '',
      symbol: c.symbol ?? null,
    })),
    timezones: raw.timezones ?? [],
  };
}

/** Performs one REST Countries call and returns the mapped objects. */
async function fetchCountries(
  path: string,
  query: Record<string, string | number> = {},
  signal?: AbortSignal,
): Promise<Country[]> {
  const url = new URL(`${COUNTRIES_API_URL}/${path}`.replace(/\/+$/, ''));
  url.searchParams.set('response_fields', RESPONSE_FIELDS);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener('abort', onCallerAbort);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Accept: 'application/json', Authorization: `Bearer ${COUNTRIES_API_KEY}` },
      signal: controller.signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) {
      throw new ApiError('REST Countries took too long to respond. Please try again.');
    }
    throw new ApiError('Could not reach REST Countries. Check your internet connection.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onCallerAbort);
  }

  let payload: RawEnvelope | null = null;
  try {
    payload = (await response.json()) as RawEnvelope;
  } catch {
    throw new ApiError(`REST Countries sent back something that is not JSON (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const first = payload?.errors?.[0];
    // The three failures worth explaining in plain words.
    const message =
      response.status === 401
        ? 'The REST Countries API key is missing or invalid. Check COUNTRIES_API_KEY in src/config.ts.'
        : first?.code === 'originNotAllowed'
          ? 'This browser address is not allowed for the REST Countries key. Add "localhost" to the key’s CORS origins at restcountries.com/api-keys.'
          : response.status === 429
            ? 'Too many country lookups at once. Wait a few seconds and try again.'
            : (first?.message ?? `REST Countries request failed with HTTP ${response.status}.`);
    throw new ApiError(message, response.status);
  }

  if (payload?.data?._demo) {
    throw new ApiError(
      'REST Countries is running on the demo key, which only returns sample data. Set COUNTRIES_API_KEY in src/config.ts.',
    );
  }

  const countries = (payload?.data?.objects ?? []).map(toCountry);
  // Remember everything we have seen, so opening a search result is instant.
  for (const country of countries) byCode.set(country.code, country);
  return countries;
}

/** Every country fetched this session, by alpha-2 code. */
const byCode = new Map<string, Country>();

/** A country for the Nation screen: from memory if seen, else one request. */
export async function getCountryByCode(code: string, signal?: AbortSignal) {
  const key = code.toUpperCase();
  const known = byCode.get(key);
  if (known) return known;

  const [country] = await fetchCountries(`codes.alpha_2/${encodeURIComponent(key)}`, {}, signal);
  if (!country) throw new ApiError(`REST Countries has no country with the code “${key}”.`, 404);
  return country;
}

/** Exact match first, then "starts with", then everything else, A–Z. */
function rankByName(countries: Country[], query: string) {
  const needle = query.trim().toLowerCase();
  const score = (c: Country) => {
    const name = c.name.toLowerCase();
    if (name === needle) return 0;
    if (name.startsWith(needle)) return 1;
    return 2;
  };
  return [...countries].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
}

/** Live search for the Nations tab. Matches common, official and alternate names. */
export async function searchCountries(query: string, signal?: AbortSignal) {
  const results = await fetchCountries('name', { q: query.trim(), limit: 25 }, signal);
  return rankByName(results, query);
}

/**
 * Footballing nations that are not sovereign countries. REST Countries only
 * knows the United Kingdom, so a player listed as "England" maps to it.
 */
const NATION_ALIASES: Record<string, string> = {
  england: 'United Kingdom',
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  'northern ireland': 'United Kingdom',
  'great britain': 'United Kingdom',
  britain: 'United Kingdom',
  uk: 'United Kingdom',
  usa: 'United States',
  us: 'United States',
  holland: 'Netherlands',
};

/** True when a player's typed nationality refers to this country. */
export function isNationalityOf(nationality: string, country: Country) {
  const key = nationality.trim().toLowerCase();
  const name = (NATION_ALIASES[key] ?? key).toLowerCase();
  return (
    name === country.name.toLowerCase() ||
    name === country.officialName.toLowerCase() ||
    name === country.code.toLowerCase() ||
    name === country.fifa?.toLowerCase()
  );
}

// One lookup per nationality per app session: the Player Card and the Nations
// tab both ask for the same few countries, and the free plan is rate-limited.
const lookupCache = new Map<string, Promise<Country | null>>();

/**
 * Resolves whatever was typed in a player's Nationality field to a country.
 * Tries the exact common name, then a name search ("Korea"), then demonyms
 * ("Brazilian"). Resolves to null when nothing matches.
 */
export function findCountry(nationality: string): Promise<Country | null> {
  const typed = nationality.trim();
  const key = typed.toLowerCase();
  if (!key) return Promise.resolve(null);

  const cached = lookupCache.get(key);
  if (cached) return cached;

  const name = NATION_ALIASES[key] ?? typed;
  const lookup = (async () => {
    const exact = await fetchCountries(`names.common/${encodeURIComponent(name)}`);
    if (exact[0]) return exact[0];

    const byName = rankByName(await fetchCountries('name', { q: name, limit: 5 }), name);
    if (byName[0]) return byName[0];

    const byDemonym = await fetchCountries('demonyms', { q: name, limit: 1 });
    return byDemonym[0] ?? null;
  })();

  // A failed lookup is not cached, so "Try again" really tries again.
  lookupCache.set(key, lookup);
  lookup.catch(() => lookupCache.delete(key));
  return lookup;
}
