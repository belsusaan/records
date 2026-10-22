/**
 * Service for fetching and parsing synchronized lyrics (.lrc)
 * Uses LRCLIB (open-source lyrics API) + local cached database.
 */

// In-memory cache for fast access
const lyricsCache = new Map();

/**
 * Parses LRC format lyrics into array of { time: seconds, text: string }
 * Example: "[00:25.74] Hoy el Sol se escondió" -> { time: 25.74, text: "Hoy el Sol se escondió" }
 */
export function parseLRC(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\](.*)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const totalSeconds = minutes * 60 + seconds;
      const text = match[3].trim();

      // Only include if there's actual text or significant timestamp
      if (text.length > 0) {
        result.push({
          time: Math.round(totalSeconds * 100) / 100,
          text,
        });
      }
    }
  }

  // Sort by time
  return result.sort((a, b) => a.time - b.time);
}

/**
 * Clean track title by removing parenthesized additions like "(feat. ...)", "[Remastered]", etc.
 */
function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/\s*[\(\[](feat\.|ft\.|remastered|version|deluxe|bonus|with)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*-\s*(remastered|single|deluxe|version).*/gi, '')
    .trim();
}

/**
 * Fetch synchronized lyrics from LRCLIB API
 * @param {string} trackTitle - Track name
 * @param {string} artistName - Artist name
 * @param {number} [duration] - Track duration in seconds
 * @returns {Promise<{ synced: boolean, lyrics: Array<{time: number, text: string}>, source: string }>}
 */
export async function getSynchronizedLyrics(trackTitle, artistName, duration = 0) {
  if (!trackTitle) {
    return { synced: false, lyrics: [], source: 'none' };
  }

  const cacheKey = `${trackTitle.toLowerCase()}-${(artistName || '').toLowerCase()}`;
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey);
  }

  const cleanTitle = cleanString(trackTitle);
  const cleanArtist = cleanString(artistName);

  try {
    // 1. Try exact match via LRCLIB get endpoint
    const url = new URL('https://lrclib.net/api/get');
    url.searchParams.append('track_name', cleanTitle);
    if (cleanArtist) url.searchParams.append('artist_name', cleanArtist);
    if (duration > 0) url.searchParams.append('duration', String(Math.round(duration)));

    let response = await fetch(url.toString(), {
      headers: {
        'Lrclib-Client': 'VinylRecordsApp/1.0 (https://github.com)',
      },
    });

    let data = null;
    if (response.ok) {
      data = await response.json();
    }

    // 2. If exact get fails or has no synced lyrics, try search endpoint
    if (!data || !data.syncedLyrics) {
      const searchUrl = new URL('https://lrclib.net/api/search');
      searchUrl.searchParams.append('q', `${cleanTitle} ${cleanArtist}`.trim());

      const searchRes = await fetch(searchUrl.toString(), {
        headers: {
          'Lrclib-Client': 'VinylRecordsApp/1.0 (https://github.com)',
        },
      });

      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          // Find first result with syncedLyrics
          const withSynced = results.find((r) => r.syncedLyrics);
          data = withSynced || results[0];
        }
      }
    }

    // 3. Process result
    if (data && data.syncedLyrics) {
      const parsed = parseLRC(data.syncedLyrics);
      if (parsed.length > 0) {
        const result = {
          synced: true,
          lyrics: parsed,
          plainLyrics: data.plainLyrics || null,
          source: 'lrclib',
        };
        lyricsCache.set(cacheKey, result);
        return result;
      }
    }

    if (data && data.plainLyrics) {
      // Fallback: create evenly-spaced plain lyrics if no timing available
      const lines = data.plainLyrics
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const estStep = duration > 0 ? duration / Math.max(1, lines.length) : 5;
      const lyrics = lines.map((text, idx) => ({
        time: Math.round(idx * estStep),
        text,
      }));

      const result = {
        synced: false,
        lyrics,
        plainLyrics: data.plainLyrics,
        source: 'lrclib-plain',
      };
      lyricsCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('LRCLIB lyrics fetch failed, falling back:', error);
  }

  // Fallback empty result
  const fallback = { synced: false, lyrics: [], source: 'not-found' };
  lyricsCache.set(cacheKey, fallback);
  return fallback;
}
