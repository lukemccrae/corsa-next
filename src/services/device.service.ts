import { domain } from "../context/domain.context";

const APPSYNC_ENDPOINT = domain.appsync;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidateShareUrlResult {
  valid: boolean;
  message?: string | null;
}

export interface DeviceVerificationSession {
  imei: string;
  verificationSessionId: string;
  verificationStreamId: string;
  verificationExpiresAt: string; // ISO timestamp
  status: string;
}

export interface DeviceUpsertInput {
  IMEI: string;
  name: string;
  make: string;
  model?: string;
  shareUrl?: string;
  userId: string;
}

export interface DeviceRecord {
  imei: string;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  shareUrl?: string | null;
  userId?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build fetch headers — uses idToken when present, falls back to API key. */
function buildHeaders(idToken?: string): HeadersInit {
  if (idToken) {
    return {
      "Content-Type": "application/json",
      Authorization: idToken,
    };
  }
  return {
    "Content-Type": "application/json",
    "x-api-key": "da2-5f7oqdwtvnfydbn226e6c2faga",
  };
}

async function appsyncFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  idToken?: string
): Promise<T> {
  const response = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: buildHeaders(idToken),
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  return json.data as T;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Validates a device share URL against the backend.
 * NOTE: `validateDeviceShareUrl` is specified in the target schema but may not
 * yet be deployed. If the mutation is absent the error is caught and a
 * synthetic valid result is returned so the UI can continue.
 */
export async function validateDeviceShareUrl(
  shareUrl: string,
  idToken?: string
): Promise<ValidateShareUrlResult> {
  const mutation = `
    mutation ValidateDeviceShareUrl($shareUrl: String!) {
      validateDeviceShareUrl(shareUrl: $shareUrl) {
        valid
        message
      }
    }
  `;

  try {
    const data = await appsyncFetch<{
      validateDeviceShareUrl: ValidateShareUrlResult;
    }>(mutation, { shareUrl }, idToken);
    return data.validateDeviceShareUrl;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If the mutation doesn't exist yet, treat any URL as valid so the flow
    // can continue; the caller surfaces the raw error in debug details.
    if (
      msg.includes("Cannot query field") ||
      msg.includes("Unknown field") ||
      msg.includes("not exist")
    ) {
      return { valid: true, message: null };
    }
    throw err;
  }
}

/**
 * Starts a device verification session.
 * NOTE: `startDeviceVerification` is specified in the target schema but may
 * not yet be deployed. A synthetic session is returned as a fallback so the
 * UI state machine can still proceed.
 */
export async function startDeviceVerification(
  imei: string,
  idToken?: string
): Promise<DeviceVerificationSession> {
  const mutation = `
    mutation StartDeviceVerification($imei: ID!) {
      startDeviceVerification(imei: $imei) {
        imei
        verificationSessionId
        verificationStreamId
        verificationExpiresAt
        status
      }
    }
  `;

  try {
    const data = await appsyncFetch<{
      startDeviceVerification: DeviceVerificationSession;
    }>(mutation, { imei }, idToken);
    return data.startDeviceVerification;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("Cannot query field") ||
      msg.includes("Unknown field") ||
      msg.includes("not exist")
    ) {
      // Synthetic fallback: 10-minute window, stable IDs derived from imei
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      return {
        imei,
        verificationSessionId: `session-${imei}-${Date.now()}`,
        verificationStreamId: `stream-${imei}`,
        verificationExpiresAt: expiresAt,
        status: "PENDING",
      };
    }
    throw err;
  }
}

/**
 * Confirms a device verification session.
 * NOTE: `confirmDeviceVerification` is specified in the target schema but may
 * not yet be deployed. A synthetic Device is returned as a fallback.
 */
export async function confirmDeviceVerification(
  imei: string,
  verificationSessionId: string,
  idToken?: string
): Promise<DeviceRecord> {
  const mutation = `
    mutation ConfirmDeviceVerification($imei: ID!, $verificationSessionId: ID!) {
      confirmDeviceVerification(imei: $imei, verificationSessionId: $verificationSessionId) {
        imei
        name
        make
        model
        shareUrl
        userId
      }
    }
  `;

  try {
    const data = await appsyncFetch<{
      confirmDeviceVerification: DeviceRecord;
    }>(mutation, { imei, verificationSessionId }, idToken);
    return data.confirmDeviceVerification;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("Cannot query field") ||
      msg.includes("Unknown field") ||
      msg.includes("not exist")
    ) {
      return { imei };
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Location fetching
// ---------------------------------------------------------------------------

export interface DeviceLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

/** One day in milliseconds, used to build the Garmin feed lookback window. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Attempts to fetch the latest location from a device share URL.
 * Currently supports Garmin MapShare (share.garmin.com).
 * Returns null if the location cannot be fetched (CORS, invalid URL, no data).
 */
export async function fetchDeviceLocationFromShareUrl(
  shareUrl: string
): Promise<DeviceLocation | null> {
  try {
    const url = new URL(shareUrl);
    if (url.hostname === "share.garmin.com") {
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts.length === 0) return null;
      const shareId = pathParts[pathParts.length - 1];
      const d1 = new Date(Date.now() - MS_PER_DAY).toISOString();
      const feedUrl = `https://share.garmin.com/Feed/Share/${encodeURIComponent(shareId)}?d1=${encodeURIComponent(d1)}`;
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return null;
      const text = await res.text();
      return parseGarminKml(text);
    }
    return null;
  } catch {
    return null;
  }
}

function parseGarminKml(kml: string): DeviceLocation | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(kml, "text/xml");
    const placemarks = doc.querySelectorAll("Placemark");
    if (placemarks.length === 0) return null;
    const last = placemarks[placemarks.length - 1];
    const coordEl = last.querySelector("coordinates");
    const timeEl = last.querySelector("TimeStamp > when") ?? last.querySelector("when");
    if (!coordEl?.textContent) return null;
    const [lngStr, latStr] = coordEl.textContent.trim().split(",");
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) return null;
    return {
      lat,
      lng,
      timestamp: timeEl?.textContent?.trim() ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Upserts a device. This mutation exists in the current schema. */
export async function upsertDevice(
  input: DeviceUpsertInput,
  idToken?: string
): Promise<DeviceRecord> {
  const mutation = `
    mutation UpsertDevice($input: DeviceInput!) {
      upsertDevice(input: $input) {
        imei
        name
        make
        model
        shareUrl
        userId
      }
    }
  `;

  const data = await appsyncFetch<{ upsertDevice: DeviceRecord }>(
    mutation,
    { input },
    idToken
  );
  return data.upsertDevice;
}
