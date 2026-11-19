/**
 * Spotify Web API & OAuth 2.0 PKCE Helper Service
 */

const SPOTIFY_CLIENT_ID_KEY = 'spotify_client_id';
const SPOTIFY_PLAYLIST_ID_KEY = 'spotify_playlist_id';
const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_REFRESH_KEY = 'spotify_refresh_token';
const SPOTIFY_EXPIRES_KEY = 'spotify_token_expires_at';
const SPOTIFY_VERIFIER_KEY = 'spotify_code_verifier';
const SPOTIFY_REDIRECT_KEY = 'spotify_redirect_uri';

// Configured Spotify Client ID provided by user
export const DEFAULT_CLIENT_ID = 'ce48e7726f0f420faf794d16da8bcbf9';
export const DEFAULT_PLAYLIST_ID = '4aF29SVP3mUQZItc3xiOV0'; // For the record, i love you more

export function getStoredConfig() {
  const envClientId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SPOTIFY_CLIENT_ID;
  const storedPlaylist = localStorage.getItem(SPOTIFY_PLAYLIST_ID_KEY);
  // Auto-upgrade legacy fallback playlist to the user's real playlist
  const effectivePlaylist = (!storedPlaylist || storedPlaylist === '37i9dQZF1DXcBWIGoYBM5M')
    ? DEFAULT_PLAYLIST_ID
    : storedPlaylist;

  return {
    clientId: localStorage.getItem(SPOTIFY_CLIENT_ID_KEY) || envClientId || DEFAULT_CLIENT_ID,
    playlistId: effectivePlaylist,
    accessToken: localStorage.getItem(SPOTIFY_TOKEN_KEY) || null,
    expiresAt: Number(localStorage.getItem(SPOTIFY_EXPIRES_KEY)) || 0,
  };
}

export function isSpotifyAuthenticated() {
  const { accessToken, expiresAt } = getStoredConfig();
  return Boolean(accessToken && Date.now() < expiresAt);
}

export function saveSpotifyConfig(clientId, playlistId) {
  if (clientId) localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, clientId.trim());
  if (playlistId) localStorage.setItem(SPOTIFY_PLAYLIST_ID_KEY, playlistId.trim());
}

export function saveTokens(token, refreshToken, expiresIn) {
  localStorage.setItem(SPOTIFY_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(SPOTIFY_REFRESH_KEY, refreshToken);
  localStorage.setItem(SPOTIFY_EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
}

export function clearSpotifyTokens() {
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
  localStorage.removeItem(SPOTIFY_REFRESH_KEY);
  localStorage.removeItem(SPOTIFY_EXPIRES_KEY);
  localStorage.removeItem(SPOTIFY_VERIFIER_KEY);
  localStorage.removeItem(SPOTIFY_REDIRECT_KEY);
}

export async function refreshSpotifyToken() {
  const refreshToken = localStorage.getItem(SPOTIFY_REFRESH_KEY);
  const clientId = getStoredConfig().clientId;
  if (!refreshToken || !clientId) return null;

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      saveTokens(
        data.access_token,
        data.refresh_token || refreshToken,
        data.expires_in || 3600
      );
      return data.access_token;
    }
  } catch (err) {
    console.error('Error refreshing Spotify access token:', err);
  }
  return null;
}

// PKCE Generation
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Initiate Spotify OAuth 2.0 PKCE Login
 */
export async function initiateSpotifyAuth(clientId) {
  const effectiveClientId = clientId || getStoredConfig().clientId;
  if (!effectiveClientId) {
    throw new Error('NO_CLIENT_ID');
  }

  const verifier = generateRandomString(64);
  localStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);
  const challenge = await generateCodeChallenge(verifier);

  const redirectUri = window.location.origin + window.location.pathname;
  localStorage.setItem(SPOTIFY_REDIRECT_KEY, redirectUri);
  const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'streaming',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email',
  ].join(' ');

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.search = new URLSearchParams({
    client_id: effectiveClientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: scopes,
  }).toString();

  window.location.href = authUrl.toString();
}

/**
 * Handle Spotify redirect code exchange
 */
export async function handleSpotifyRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return null;

  const verifier = localStorage.getItem(SPOTIFY_VERIFIER_KEY);
  const clientId = getStoredConfig().clientId;
  const redirectUri = localStorage.getItem(SPOTIFY_REDIRECT_KEY) || (window.location.origin + window.location.pathname);

  if (!verifier || !clientId) {
    window.history.replaceState({}, document.title, window.location.pathname);
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      saveTokens(data.access_token, data.refresh_token, data.expires_in);
      window.history.replaceState({}, document.title, window.location.pathname);
      return data.access_token;
    }
  } catch (err) {
    console.error('Error exchanging Spotify authorization code:', err);
  }

  window.history.replaceState({}, document.title, window.location.pathname);
  return null;
}

/**
 * Spotify API fetch wrapper
 */
export async function spotifyFetch(endpoint, method = 'GET', body = null) {
  let { accessToken, expiresAt } = getStoredConfig();

  if (!accessToken || Date.now() >= expiresAt) {
    const refreshed = await refreshSpotifyToken();
    if (refreshed) {
      accessToken = refreshed;
    } else {
      return null;
    }
  }

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    let res = await fetch(`https://api.spotify.com/v1${endpoint}`, options);
    if (res.status === 204) return true;
    if (res.status === 200 || res.status === 201) {
      const text = await res.text();
      if (!text || !text.trim()) return true;
      try {
        return JSON.parse(text);
      } catch {
        return true;
      }
    }
    if (res.status === 401) {
      // Try refresh once
      const newToken = await refreshSpotifyToken();
      if (newToken) {
        options.headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(`https://api.spotify.com/v1${endpoint}`, options);
        if (res.status === 204) return true;
        if (res.status === 200 || res.status === 201) {
          const text = await res.text();
          if (!text || !text.trim()) return true;
          try {
            return JSON.parse(text);
          } catch {
            return true;
          }
        }
        if (res.ok) return await res.json();
      }
      clearSpotifyTokens();
      return null;
    }
    if (!res.ok) {
      let errData = null;
      try {
        errData = await res.json();
      } catch {
        // ignore
      }
      console.warn('[Spotify Error 403/API]', res.status, endpoint, errData);
      return {
        error: true,
        status: res.status,
        reason:
          errData?.error?.reason ||
          (errData?.error?.message?.includes('registered') ? 'USER_NOT_REGISTERED' : null) ||
          (res.status === 403 ? 'PREMIUM_REQUIRED' : res.status === 404 ? 'NO_ACTIVE_DEVICE' : null),
        message: errData?.error?.message || res.statusText,
      };
    }
    return await res.json();
  } catch (e) {
    console.error('Spotify API fetch error:', e);
    return null;
  }
}

/**
 * Spotify Playback Controls
 */
export async function spotifyPlay(options = null) {
  let body = null;
  if (options) {
    body = {};
    if (options.context_uri) body.context_uri = options.context_uri;
    if (options.uris) body.uris = options.uris;
    if (options.offset) body.offset = options.offset;
    if (options.position_ms) body.position_ms = options.position_ms;
  }
  return await spotifyFetch('/me/player/play', 'PUT', body);
}

export async function spotifyGetDevices() {
  const data = await spotifyFetch('/me/player/devices');
  return data?.devices || [];
}

export async function spotifyTransferPlayback(deviceId, play = true) {
  return await spotifyFetch('/me/player', 'PUT', {
    device_ids: [deviceId],
    play: play,
  });
}

export async function spotifyStartGiftPlaylist(trackUri = null) {
  const playlistId = getStoredConfig().playlistId || DEFAULT_PLAYLIST_ID;
  const contextUri = `spotify:playlist:${playlistId}`;

  let devices = [];
  try {
    devices = (await spotifyGetDevices()) || [];
  } catch (e) {
    // ignore
  }

  // If no devices initially, give Spotify 350ms to report background device
  if (!devices || devices.length === 0) {
    await new Promise((r) => setTimeout(r, 350));
    try {
      devices = (await spotifyGetDevices()) || [];
    } catch (e) {
      // ignore
    }
  }

  const activeDevice = devices.find((d) => d.is_active);
  const targetDevice = activeDevice || (devices && devices[0]);

  const query = targetDevice ? `?device_id=${targetDevice.id}` : '';
  const body = {
    context_uri: contextUri,
  };

  if (trackUri) {
    body.offset = { uri: trackUri };
  } else {
    body.offset = { position: 0 };
  }

  let res = await spotifyFetch(`/me/player/play${query}`, 'PUT', body);

  // Fallback: If context_uri fails (e.g. playlist permissions or mobile issue), try direct track URI
  if (res?.error && trackUri) {
    console.log('Falling back to direct track URI playback:', trackUri);
    const directRes = await spotifyFetch(`/me/player/play${query}`, 'PUT', {
      uris: [trackUri],
    });
    if (!directRes?.error) {
      return directRes;
    }
  }

  return res;
}

export async function spotifyGetPlaylist(playlistId = null) {
  const effectiveId = playlistId || getStoredConfig().playlistId || DEFAULT_PLAYLIST_ID;
  if (!effectiveId) return null;
  return await spotifyFetch(`/playlists/${effectiveId}`);
}

export async function spotifyPause(deviceId = null) {
  let targetId = deviceId;
  try {
    const devices = (await spotifyGetDevices()) || [];
    const active = devices.find((d) => d.is_active);
    const target = active || devices[0];
    if (target) {
      targetId = target.id;
    }
  } catch (e) {
    // ignore
  }

  const query = targetId ? `?device_id=${targetId}` : '';
  let res = await spotifyFetch(`/me/player/pause${query}`, 'PUT');
  if (!res && targetId) {
    res = await spotifyFetch('/me/player/pause', 'PUT');
  }
  return res;
}

export async function spotifyNext() {
  return await spotifyFetch('/me/player/next', 'POST');
}

export async function spotifyPrevious() {
  return await spotifyFetch('/me/player/previous', 'POST');
}

export async function spotifySeek(positionMs) {
  return await spotifyFetch(`/me/player/seek?position_ms=${Math.floor(positionMs)}`, 'PUT');
}

export async function spotifySetShuffle(state, deviceId = null) {
  let targetId = deviceId;
  try {
    const devices = (await spotifyGetDevices()) || [];
    const active = devices.find((d) => d.is_active);
    const target = active || devices[0];
    if (target) {
      targetId = target.id;
    }
  } catch (e) {
    // ignore
  }

  const query = targetId ? `?state=${Boolean(state)}&device_id=${targetId}` : `?state=${Boolean(state)}`;
  let res = await spotifyFetch(`/me/player/shuffle${query}`, 'PUT');
  if (!res && targetId) {
    res = await spotifyFetch(`/me/player/shuffle?state=${Boolean(state)}`, 'PUT');
  }
  return res;
}

export async function spotifySetRepeat(state, deviceId = null) {
  // state: boolean | 'track' | 'off'
  // ONLY 'track' (repeat single song) or 'off' (no repeat). Never 'context' (playlist).
  const repeatMode = state === true || state === 'track' ? 'track' : 'off';
  let targetId = deviceId;

  try {
    const devices = (await spotifyGetDevices()) || [];
    const active = devices.find((d) => d.is_active);
    const target = active || devices[0];
    if (target) {
      targetId = target.id;
    }
  } catch (e) {
    // ignore
  }

  const query = targetId ? `?state=${repeatMode}&device_id=${targetId}` : `?state=${repeatMode}`;
  let res = await spotifyFetch(`/me/player/repeat${query}`, 'PUT');
  if (!res && targetId) {
    res = await spotifyFetch(`/me/player/repeat?state=${repeatMode}`, 'PUT');
  }
  return res;
}

export async function spotifyGetPlayback() {
  return await spotifyFetch('/me/player');
}

export async function spotifyGetUserProfile() {
  return await spotifyFetch('/me');
}

/**
 * Follow / Save Playlist to User's Spotify Library
 * PUT https://api.spotify.com/v1/playlists/{playlist_id}/followers
 */
export async function spotifyFollowPlaylist(playlistId = null) {
  const effectiveId = playlistId || getStoredConfig().playlistId || DEFAULT_PLAYLIST_ID;
  if (!effectiveId) return false;

  try {
    const res = await spotifyFetch(`/playlists/${effectiveId}/followers`, 'PUT', {
      public: true,
    });
    return Boolean(res);
  } catch (err) {
    console.error('Error following playlist:', err);
    return false;
  }
}

/**
 * Check if the user is already following the playlist
 * GET https://api.spotify.com/v1/playlists/{playlist_id}/followers/contains
 */
export async function spotifyCheckFollowPlaylist(playlistId = null) {
  const effectiveId = playlistId || getStoredConfig().playlistId || DEFAULT_PLAYLIST_ID;
  if (!effectiveId) return false;

  try {
    const res = await spotifyFetch(`/playlists/${effectiveId}/followers/contains`);
    if (Array.isArray(res) && typeof res[0] === 'boolean') {
      return res[0];
    }
  } catch (err) {
    // ignore
  }
  return false;
}
