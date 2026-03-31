import type { Post } from "./post";

export interface CatalogPage {
  page: number;
  threads: Post[];
}
