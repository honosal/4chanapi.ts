# 4capi

A typed TypeScript client for the [4chan API](https://github.com/4chan/4chan-API), designed for React Native.

- Full TypeScript types for every endpoint
- Built-in rate limiting (≤ 1 request/sec, per API rules)
- `If-Modified-Since` support — returns `null` on HTTP 304
- URL helpers for images, thumbnails, flags, and spoilers
- No Node.js dependencies — uses `fetch` natively available in React Native

---

## Installation

```sh
npm install 4capi
```

---

## Quick Start

```ts
import { FourChanClient } from "4capi";

const client = new FourChanClient();

const thread = await client.getThread("g", 100000000);
if (thread) {
  const op = thread.posts[0];
  console.log(op.sub);   // thread subject
  console.log(op.com);   // comment (HTML-escaped)
}
```

---

## API Reference

### `new FourChanClient()`

Creates a client with a built-in rate limiter. All requests are serialised with at least 1 second between dispatches.

```ts
const client = new FourChanClient();
```

---

### `getBoards()`

Fetches all boards and their settings.

```ts
const boards = await client.getBoards();
```

**Response: `Board[]`**

```json
[
  {
    "board": "g",
    "title": "Technology",
    "ws_board": 1,
    "per_page": 15,
    "pages": 10,
    "max_filesize": 4096,
    "max_webm_filesize": 3072,
    "max_comment_chars": 2000,
    "max_webm_duration": 120,
    "bump_limit": 310,
    "image_limit": 150,
    "cooldowns": {
      "threads": 600,
      "replies": 60,
      "images": 60
    },
    "meta_description": "...",
    "is_archived": 1
  }
]
```

**`Board` fields**

| Field | Type | Description |
|---|---|---|
| `board` | `string` | Board directory name (e.g. `"g"`, `"po"`) |
| `title` | `string` | Human-readable board title |
| `ws_board` | `0 \| 1` | 1 = worksafe |
| `per_page` | `number` | Threads per index page |
| `pages` | `number` | Total number of index pages |
| `max_filesize` | `number` | Max non-webm file size in KB |
| `max_webm_filesize` | `number` | Max webm file size in KB |
| `max_comment_chars` | `number` | Max characters in a comment |
| `max_webm_duration` | `number` | Max webm duration in seconds |
| `bump_limit` | `number` | Replies before thread stops bumping |
| `image_limit` | `number` | Max image replies per thread |
| `cooldowns` | `BoardCooldowns` | `{ threads, replies, images }` in seconds |
| `is_archived?` | `0 \| 1` | Archive enabled on this board |
| `country_flags?` | `0 \| 1` | Country flags enabled |
| `user_ids?` | `0 \| 1` | Poster IDs enabled |
| `board_flags?` | `Record<string, string>` | Map of flag code → name |
| `spoilers?` | `0 \| 1` | Spoiler images enabled |
| `custom_spoilers?` | `number` | Number of custom spoiler variants |

---

### `getThread(board, threadId, opts?)`

Fetches a full thread including all replies.

Returns `null` if the thread has not changed since `opts.ifModifiedSince`.

```ts
const thread = await client.getThread("po", 570368);

// With If-Modified-Since (returns null on HTTP 304)
const lastFetch = new Date();
const updated = await client.getThread("po", 570368, {
  ifModifiedSince: lastFetch,
});
if (updated === null) {
  console.log("No new posts");
}
```

**Response: `Thread | null`**

```json
{
  "posts": [
    {
      "no": 570368,
      "resto": 0,
      "sticky": 1,
      "now": "01/01/24(Mon)00:00",
      "time": 1704067200,
      "name": "Anonymous",
      "sub": "Welcome to /po/",
      "com": "Paper &amp; origami thread.",
      "tim": 1704067200123,
      "filename": "origami",
      "ext": ".jpg",
      "fsize": 204800,
      "md5": "abc123def456ghi789jkl0==",
      "w": 1200,
      "h": 800,
      "tn_w": 250,
      "tn_h": 166,
      "replies": 42,
      "images": 18,
      "unique_ips": 15,
      "last_modified": 1704099600,
      "semantic_url": "welcome-to-po"
    },
    {
      "no": 570400,
      "resto": 570368,
      "now": "01/01/24(Mon)01:30",
      "time": 1704072600,
      "name": "Anonymous",
      "com": "Nice thread, here&#039;s my latest crane.",
      "tim": 1704072600456,
      "filename": "crane",
      "ext": ".png",
      "fsize": 102400,
      "md5": "xyz789abc012def345ghi6==",
      "w": 800,
      "h": 600,
      "tn_w": 250,
      "tn_h": 187
    }
  ]
}
```

---

### `getCatalog(board, opts?)`

Fetches all threads on a board grouped by page, including the most recent reply previews.

```ts
const catalog = await client.getCatalog("g");

// With cache check
const catalog = await client.getCatalog("g", { ifModifiedSince: lastFetch });
if (catalog === null) return; // not modified

for (const page of catalog) {
  for (const thread of page.threads) {
    console.log(`[${thread.no}] ${thread.sub ?? "(no subject)"} — ${thread.replies} replies`);
  }
}
```

**Response: `CatalogPage[] | null`**

```json
[
  {
    "page": 1,
    "threads": [
      {
        "no": 100000001,
        "resto": 0,
        "now": "03/29/26(Sun)12:00",
        "time": 1743249600,
        "name": "Anonymous",
        "sub": "Programming thread",
        "com": "Post your projects.",
        "tim": 1743249600789,
        "filename": "code",
        "ext": ".png",
        "w": 1920,
        "h": 1080,
        "tn_w": 250,
        "tn_h": 140,
        "replies": 87,
        "images": 12,
        "omitted_posts": 82,
        "omitted_images": 10,
        "last_modified": 1743260000,
        "semantic_url": "programming-thread",
        "last_replies": [
          {
            "no": 100000088,
            "resto": 100000001,
            "now": "03/29/26(Sun)14:55",
            "time": 1743260100,
            "name": "Anonymous",
            "com": "Just finished my Rust project."
          }
        ]
      }
    ]
  }
]
```

---

### `getThreadList(board)`

Fetches a lightweight list of all threads and their last-modified timestamps. Useful for polling — much smaller than the full catalog.

```ts
const pages = await client.getThreadList("g");

for (const page of pages) {
  for (const thread of page.threads) {
    console.log(thread.no, thread.last_modified, thread.replies);
  }
}
```

**Response: `ThreadListPage[]`**

```json
[
  {
    "page": 1,
    "threads": [
      { "no": 100000001, "last_modified": 1743260000, "replies": 87 },
      { "no": 100000002, "last_modified": 1743259000, "replies": 12 }
    ]
  },
  {
    "page": 2,
    "threads": [
      { "no": 99999900, "last_modified": 1743240000, "replies": 310 }
    ]
  }
]
```

---

### `getIndex(board, page, opts?)`

Fetches a single index page (threads + preview replies). Pages are 1-based.

```ts
const indexPage = await client.getIndex("g", 1);
if (indexPage) {
  for (const thread of indexPage) {
    const op = thread.posts[0];
    console.log(op.sub, op.replies);
  }
}
```

**Response: `IndexPage | null`** — an array of `{ posts: Post[] }` objects

---

### `getArchive(board)`

Fetches the list of archived thread IDs. Returns an empty array for boards without archives.

```ts
const archivedIds = await client.getArchive("g");
// [571958, 572866, 54195, ...]
```

**Response: `number[]`**

```json
[571958, 572866, 54195, 12345, 67890]
```

---

## URL Helpers

### `getImageUrl(board, tim, ext)`

Full-size image URL.

```ts
import { getImageUrl } from "4capi";

const url = getImageUrl("g", post.tim!, post.ext!);
// "https://i.4cdn.org/g/1743249600789.png"
```

### `getThumbnailUrl(board, tim)`

Thumbnail URL (always JPEG).

```ts
import { getThumbnailUrl } from "4capi";

const thumb = getThumbnailUrl("g", post.tim!);
// "https://i.4cdn.org/g/1743249600789s.jpg"
```

### `getCountryFlagUrl(countryCode)`

Country flag GIF (boards with `country_flags` enabled).

```ts
import { getCountryFlagUrl } from "4capi";

const flag = getCountryFlagUrl(post.country!);
// "https://s.4cdn.org/image/country/us.gif"
```

### `getBoardFlagUrl(board, flagCode)`

Board-specific flag GIF (boards with `board_flags` enabled).

```ts
import { getBoardFlagUrl } from "4capi";

const flag = getBoardFlagUrl("pol", post.board_flag!);
// "https://s.4cdn.org/image/flags/pol/EU.gif"
```

### `getSpoilerUrl(board, customIndex?)`

Spoiler placeholder image. Pass a `customIndex` (1–10) for boards with custom spoilers.

```ts
import { getSpoilerUrl } from "4capi";

getSpoilerUrl("b");          // default spoiler
getSpoilerUrl("co", 3);      // custom spoiler #3 for /co/
```

### `icons`

Static icon URLs as constants.

```ts
import { icons } from "4capi";

icons.sticky       // https://s.4cdn.org/image/sticky.gif
icons.closed       // https://s.4cdn.org/image/closed.gif
icons.admin        // https://s.4cdn.org/image/adminicon.gif
icons.mod          // https://s.4cdn.org/image/modicon.gif
icons.developer    // https://s.4cdn.org/image/developericon.gif
icons.manager      // https://s.4cdn.org/image/managericon.gif
icons.founder      // https://s.4cdn.org/image/foundericon.gif
icons.fileDeletedOp     // https://s.4cdn.org/image/filedeleted.gif
icons.fileDeletedReply  // https://s.4cdn.org/image/filedeleted-res.gif
```

---

## Error Handling

All methods throw `FourChanApiError` on non-200/304 responses (e.g. 404 for a thread that no longer exists).

```ts
import { FourChanClient, FourChanApiError } from "4capi";

const client = new FourChanClient();

try {
  const thread = await client.getThread("g", 1);
} catch (err) {
  if (err instanceof FourChanApiError) {
    console.error(`HTTP ${err.status} — ${err.url}`);
    if (err.status === 404) {
      // thread was deleted
    }
  }
}
```

---

## Efficient Polling Pattern

Use `getThreadList` to detect changes cheaply, then only fetch threads that have actually updated.

```ts
const client = new FourChanClient();

let knownThreads = new Map<number, number>(); // threadId → last_modified

async function poll() {
  const pages = await client.getThreadList("g");

  for (const page of pages) {
    for (const entry of page.threads) {
      const prev = knownThreads.get(entry.no);

      if (!prev || prev < entry.last_modified) {
        const thread = await client.getThread("g", entry.no, {
          ifModifiedSince: prev ? new Date(prev * 1000) : undefined,
        });
        if (thread) {
          knownThreads.set(entry.no, entry.last_modified);
          // handle updated thread...
        }
      }
    }
  }
}

// Poll every 30 seconds (the client enforces the per-request 1s rate limit)
setInterval(poll, 30_000);
```

---

## Post Field Reference

All fields on `Post` except `no`, `resto`, `now`, `time`, and `name` are optional — they only appear when applicable.

| Field | Type | Present when |
|---|---|---|
| `no` | `number` | Always |
| `resto` | `number` | Always — `0` for OP |
| `time` | `number` | Always — UNIX timestamp |
| `now` | `string` | Always — `MM/DD/YY(Day)HH:MM` |
| `name` | `string` | Always — defaults to `"Anonymous"` |
| `sub` | `string` | OP only, if subject was set |
| `com` | `string` | If a comment was included |
| `trip` | `string` | If poster used a tripcode |
| `id` | `string` | On boards with user IDs |
| `capcode` | `Capcode` | Staff posts only |
| `country` | `string` | On boards with country flags |
| `board_flag` | `string` | On boards with board flags |
| `since4pass` | `number` | If poster used 4chan pass option |
| `tim` | `number` | If post has an attachment |
| `filename` | `string` | If post has an attachment |
| `ext` | `string` | If post has an attachment |
| `fsize` | `number` | If post has an attachment |
| `md5` | `string` | If post has an attachment |
| `w` / `h` | `number` | If post has an attachment |
| `tn_w` / `tn_h` | `number` | If post has an attachment |
| `spoiler` | `1` | If file is spoilered |
| `custom_spoiler` | `number` | If board has custom spoilers |
| `filedeleted` | `1` | If file was deleted |
| `m_img` | `1` | If mobile-optimised image exists |
| `sticky` | `1` | OP — if thread is pinned |
| `closed` | `1` | OP — if thread is locked |
| `bumplimit` | `1` | OP — if bump limit reached |
| `imagelimit` | `1` | OP — if image limit reached |
| `replies` | `number` | OP — total reply count |
| `images` | `number` | OP — total image reply count |
| `omitted_posts` | `number` | OP — replies not shown in preview |
| `omitted_images` | `number` | OP — image replies not shown in preview |
| `last_modified` | `number` | OP — UNIX timestamp of last activity |
| `semantic_url` | `string` | OP — SEO slug |
| `unique_ips` | `number` | OP — unique poster count (live threads) |
| `last_replies` | `Post[]` | OP — preview of most recent replies |
| `archived` | `1` | OP — if thread is archived |
| `archived_on` | `number` | OP — UNIX timestamp of archival |
| `tag` | `string` | OP — `/f/` flash category |

---

## Building

```sh
npm run build      # compiles to dist/
npm run typecheck  # type-check only, no output
```

---

## 4chan API Terms of Service

- Do not use "4chan" in your app name, product, or service name.
- Do not use the 4chan name, logo, or brand to promote your app.
- Credit the source as 4chan with a link.
- Do not claim your app is official.
- Do not clone 4chan or re-host/repackage the API JSON with ads.

Full terms: [https://github.com/4chan/4chan-API](https://github.com/4chan/4chan-API)
