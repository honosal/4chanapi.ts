export type Capcode =
  | "mod"
  | "admin"
  | "admin_highlight"
  | "manager"
  | "developer"
  | "founder";

export interface Post {
  /** Post number */
  no: number;
  /** Thread OP number this post replies to; 0 if this post is the OP */
  resto: number;
  /** MM/DD/YY(Day)HH:MM timestamp string (EST/EDT) */
  now: string;
  /** UNIX timestamp */
  time: number;
  /** Poster name (defaults to "Anonymous") */
  name: string;

  // Optional poster info
  /** Tripcode (!tripcode or !!securetripcode) */
  trip?: string;
  /** 8-character poster ID (shown on boards with user IDs enabled) */
  id?: string;
  /** Poster's capcode role */
  capcode?: Capcode;
  /** ISO 3166-1 alpha-2 country code, or "XX" for unknown */
  country?: string;
  /** Full country name */
  country_name?: string;
  /** Board flag code */
  board_flag?: string;
  /** Board flag display name */
  flag_name?: string;
  /** 4-digit year the poster purchased a 4chan pass */
  since4pass?: number;

  // Post content
  /** OP subject line */
  sub?: string;
  /** Comment body (HTML-escaped) */
  com?: string;

  // File attachment fields (present when an image/file was attached)
  /** Unix timestamp + microtime used as the image filename on the CDN */
  tim?: number;
  /** Original filename (without extension) */
  filename?: string;
  /** File extension, e.g. ".jpg" */
  ext?: string;
  /** File size in bytes */
  fsize?: number;
  /** Base64-encoded MD5 hash of the file (24 characters) */
  md5?: string;
  /** Full-size image width */
  w?: number;
  /** Full-size image height */
  h?: number;
  /** Thumbnail width */
  tn_w?: number;
  /** Thumbnail height */
  tn_h?: number;
  /** 1 if the file has been deleted */
  filedeleted?: 1;
  /** 1 if the file is spoilered */
  spoiler?: 1;
  /** Custom spoiler image index (1–10) */
  custom_spoiler?: number;
  /** 1 if a mobile-optimised image exists */
  m_img?: 1;
  /** Flash (.swf) category tag */
  tag?: string;

  // OP-only fields
  /** 1 if thread is pinned to the top */
  sticky?: 1;
  /** 1 if thread is closed to replies */
  closed?: 1;
  /** 1 if thread has reached the bump limit */
  bumplimit?: 1;
  /** 1 if thread has reached the image limit */
  imagelimit?: 1;
  /** Total reply count */
  replies?: number;
  /** Total image reply count */
  images?: number;
  /** Number of replies not shown in the preview */
  omitted_posts?: number;
  /** Number of image replies not shown in the preview */
  omitted_images?: number;
  /** UNIX timestamp of the last post or file in the thread */
  last_modified?: number;
  /** SEO-friendly URL slug */
  semantic_url?: string;
  /** Number of unique posters (only present on live threads) */
  unique_ips?: number;
  /** Most recent reply previews (catalog / index pages) */
  last_replies?: Post[];

  // Archive-specific
  /** 1 if the thread has been archived */
  archived?: 1;
  /** UNIX timestamp when the thread was archived */
  archived_on?: number;
}
