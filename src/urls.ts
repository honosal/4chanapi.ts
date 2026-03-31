const API_BASE = "https://a.4cdn.org";
const MEDIA_BASE = "https://i.4cdn.org";
const STATIC_BASE = "https://s.4cdn.org";

// ---------------------------------------------------------------------------
// Media URLs
// ---------------------------------------------------------------------------

/**
 * Full-size user-uploaded image.
 * @param board  Board directory name (e.g. "po")
 * @param tim    The `tim` field from a post (unix timestamp + microtime)
 * @param ext    The `ext` field from a post (e.g. ".jpg")
 */
export function getImageUrl(board: string, tim: number, ext: string): string {
  return `${MEDIA_BASE}/${board}/${tim}${ext}`;
}

/**
 * Thumbnail for a user-uploaded image.
 * @param board  Board directory name
 * @param tim    The `tim` field from a post
 */
export function getThumbnailUrl(board: string, tim: number): string {
  return `${MEDIA_BASE}/${board}/${tim}s.jpg`;
}

// ---------------------------------------------------------------------------
// Flag URLs
// ---------------------------------------------------------------------------

/**
 * Individual country flag GIF (used on boards with `country_flags` enabled).
 * @param countryCode  ISO 3166-1 alpha-2 country code, e.g. "US"
 */
export function getCountryFlagUrl(countryCode: string): string {
  return `${STATIC_BASE}/image/country/${countryCode.toLowerCase()}.gif`;
}

/**
 * Individual board flag GIF (used on boards with `board_flags` enabled).
 * @param board      Board directory name
 * @param flagCode   Flag code from the post's `board_flag` field
 */
export function getBoardFlagUrl(board: string, flagCode: string): string {
  return `${STATIC_BASE}/image/flags/${board}/${flagCode}.gif`;
}

// ---------------------------------------------------------------------------
// Spoiler URLs
// ---------------------------------------------------------------------------

/**
 * Spoiler image URL.
 * @param board         Board directory name — used for custom spoilers
 * @param customIndex   Custom spoiler index (1–10). Omit for the default spoiler.
 */
export function getSpoilerUrl(board: string, customIndex?: number): string {
  if (customIndex !== undefined) {
    return `${STATIC_BASE}/image/spoiler-${board}${customIndex}.png`;
  }
  return `${STATIC_BASE}/image/spoiler.png`;
}

// ---------------------------------------------------------------------------
// Static icon URLs (constants)
// ---------------------------------------------------------------------------

export const icons = {
  sticky: `${STATIC_BASE}/image/sticky.gif`,
  closed: `${STATIC_BASE}/image/closed.gif`,
  admin: `${STATIC_BASE}/image/adminicon.gif`,
  mod: `${STATIC_BASE}/image/modicon.gif`,
  developer: `${STATIC_BASE}/image/developericon.gif`,
  manager: `${STATIC_BASE}/image/managericon.gif`,
  founder: `${STATIC_BASE}/image/foundericon.gif`,
  fileDeletedOp: `${STATIC_BASE}/image/filedeleted.gif`,
  fileDeletedReply: `${STATIC_BASE}/image/filedeleted-res.gif`,
} as const;

// ---------------------------------------------------------------------------
// API endpoint URL builders (for reference / cache-key construction)
// ---------------------------------------------------------------------------

export const apiUrls = {
  boards: () => `${API_BASE}/boards.json`,
  threadList: (board: string) => `${API_BASE}/${board}/threads.json`,
  catalog: (board: string) => `${API_BASE}/${board}/catalog.json`,
  archive: (board: string) => `${API_BASE}/${board}/archive.json`,
  index: (board: string, page: number) => `${API_BASE}/${board}/${page}.json`,
  thread: (board: string, threadId: number) =>
    `${API_BASE}/${board}/thread/${threadId}.json`,
} as const;
