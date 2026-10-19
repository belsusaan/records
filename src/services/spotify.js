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
export const DEFAULT_PLAYLIST_ID = '37i9dQZF1DXcBWIGoYBM5M'; // Fallback playlist

export function getStoredConfig() {
  const envClientId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SPOTIFY_CLIENT_ID;
  return {
    clientId: localStorage.getItem(SPOTIFY_CLIENT_ID_KEY) || envClientId || DEFAULT_CLIENT_ID,
    playlistId: localStorage.getItem(SPOTIFY_PLAYLIST_ID_KEY) || DEFAULT_PLAYLIST_ID,
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
  const { accessToken, expiresAt } = getStoredConfig();
  if (!accessToken || Date.now() > expiresAt) {
    return null;
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
    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, options);
    if (res.status === 204) return true;
    if (res.status === 401) {
      clearSpotifyTokens();
      return null;
    }
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Spotify API fetch error:', e);
    return null;
  }
}

/**
 * Spotify Playback Controls
 */
export async function spotifyPlay() {
  return await spotifyFetch('/me/player/play', 'PUT');
}

export async function spotifyPause() {
  return await spotifyFetch('/me/player/pause', 'PUT');
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

export async function spotifySetShuffle(state) {
  return await spotifyFetch(`/me/player/shuffle?state=${Boolean(state)}`, 'PUT');
}

export async function spotifySetRepeat(state) {
  // state: 'track', 'context', 'off'
  const repeatMode = state ? 'track' : 'off';
  return await spotifyFetch(`/me/player/repeat?state=${repeatMode}`, 'PUT');
}

export async function spotifyGetPlayback() {
  return await spotifyFetch('/me/player');
}

export async function spotifyGetUserProfile() {
  return await spotifyFetch('/me');
}
