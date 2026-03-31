export interface BoardCooldowns {
  threads: number;
  replies: number;
  images: number;
}

export interface Board {
  /** Board directory name (e.g. "a", "b", "po") */
  board: string;
  /** Human-readable board title */
  title: string;
  /** 1 if worksafe, 0 otherwise */
  ws_board: 0 | 1;
  /** Threads per index page */
  per_page: number;
  /** Number of index pages */
  pages: number;
  /** Max non-webm file size in KB */
  max_filesize: number;
  /** Max webm file size in KB */
  max_webm_filesize: number;
  /** Max characters in a post comment */
  max_comment_chars: number;
  /** Max webm duration in seconds */
  max_webm_duration: number;
  /** Max replies before thread stops bumping */
  bump_limit: number;
  /** Max image replies per thread */
  image_limit: number;
  /** Cooldowns for threads, replies, and images */
  cooldowns: BoardCooldowns;
  /** SEO meta description */
  meta_description: string;

  // Optional / feature-gated fields
  spoilers?: 0 | 1;
  custom_spoilers?: number;
  is_archived?: 0 | 1;
  /** Map of flag code → flag name */
  board_flags?: Record<string, string>;
  country_flags?: 0 | 1;
  user_ids?: 0 | 1;
  oekaki?: 0 | 1;
  sjis_tags?: 0 | 1;
  code_tags?: 0 | 1;
  math_tags?: 0 | 1;
  text_only?: 0 | 1;
  forced_anon?: 0 | 1;
  webm_audio?: 0 | 1;
  require_subject?: 0 | 1;
  min_image_width?: number;
  min_image_height?: number;
}

export interface BoardsResponse {
  boards: Board[];
  troll_flags?: Record<string, string>;
}
