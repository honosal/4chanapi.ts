import type { Post } from "./post";

/** Full thread response from /<board>/thread/<id>.json */
export interface Thread {
  posts: Post[];
}

/** Single thread entry on an index page */
export interface IndexThread {
  posts: Post[];
}

/** Response from /<board>/<page#>.json — an array of thread+preview-replies objects */
export type IndexPage = IndexThread[];
