export interface ThreadListEntry {
  /** OP post number */
  no: number;
  /** UNIX timestamp of the last modification */
  last_modified: number;
  /** Total reply count */
  replies: number;
}

export interface ThreadListPage {
  page: number;
  threads: ThreadListEntry[];
}
