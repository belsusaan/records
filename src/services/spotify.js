/**
 * Spotify Web API & OAuth 2.0 PKCE Helper Service
 */

const SPOTIFY_CLIENT_ID_KEY = 'spotify_client_id';
const SPOTIFY_PLAYLIST_ID_KEY = 'spotify_playlist_id';
const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_REFRESH_KEY = 'spotify_refresh_token';
const SPOTIFY_EXPIRES_KEY = 'spotify_token_expires_at';
const SPOTIFY_VERIFIER_KEY = 'spotify_code_verifier';

// Default Demo / Fallback config
export const DEFAULT_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
export const DEFAULT_PLAYLIST_ID = import.meta.env.VITE_SPOTIFY_PLAYLIST_ID || '37i9dQZF1DXcBWIGoYBM5M'; // Today's Top Hits / Lo-fi default

export function getStoredConfig() {
  return {
    clientId: localStorage.getItem(SPOTIFY_CLIENT_ID_KEY) || DEFAULT_CLIENT_ID,
    playlistId: localStorage.getItem(SPOTIFY_PLAYLIST_ID_KEY) || DEFAULT_PLAYLIST_ID,
    accessToken: localStorage.getItem(SPOTIFY_TOKEN_KEY) || null,
    expiresAt: Number(localStorage.getItem(SPOTIFY_EXPIRES_KEY)) || 0,
  };
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
  const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
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
  const redirectUri = window.location.origin + window.location.pathname;

  if (!verifier || !clientId) {
    // Clean up url
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
    if (res.status === 204) return true; // No content success
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
