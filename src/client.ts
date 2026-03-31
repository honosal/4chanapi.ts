import { RateLimiter } from "./rate-limiter";
import { apiUrls } from "./urls";
import type { Board, BoardsResponse } from "./types/board";
import type { CatalogPage } from "./types/catalog";
import type { Thread, IndexPage } from "./types/thread";
import type { ThreadListPage } from "./types/threadlist";

export interface FetchOptions {
  /**
   * When provided, the request is sent with an `If-Modified-Since` header.
   * If the server responds with HTTP 304, the method returns `null`.
   */
  ifModifiedSince?: Date;
}

export class FourChanClient {
  private readonly limiter: RateLimiter;

  constructor() {
    this.limiter = new RateLimiter(1000);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async fetchJson<T>(
    url: string,
    opts?: FetchOptions
  ): Promise<T | null> {
    return this.limiter.schedule(async () => {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (opts?.ifModifiedSince) {
        headers["If-Modified-Since"] = opts.ifModifiedSince.toUTCString();
      }

      const response = await fetch(url, { headers });

      if (response.status === 304) {
        return null;
      }

      if (!response.ok) {
        throw new FourChanApiError(response.status, url);
      }

      return response.json() as Promise<T>;
    });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Fetch all boards and their settings.
   * Endpoint: `GET https://a.4cdn.org/boards.json`
   */
  async getBoards(): Promise<Board[]> {
    const data = await this.fetchJson<BoardsResponse>(apiUrls.boards());
    // boards.json is not conditional so null won't occur in practice,
    // but the type constraint requires us to handle it.
    return data?.boards ?? [];
  }

  /**
   * Fetch the thread summary list for a board (lightweight; useful for polling).
   * Returns an array of pages, each with a list of threads and their
   * last-modified timestamps and reply counts.
   *
   * Endpoint: `GET https://a.4cdn.org/<board>/threads.json`
   */
  async getThreadList(board: string): Promise<ThreadListPage[]> {
    const data = await this.fetchJson<ThreadListPage[]>(
      apiUrls.threadList(board)
    );
    return data ?? [];
  }

  /**
   * Fetch the full catalog for a board (all OPs + preview replies).
   * Returns `null` when the server responds with HTTP 304 (not modified).
   *
   * Endpoint: `GET https://a.4cdn.org/<board>/catalog.json`
   */
  async getCatalog(
    board: string,
    opts?: FetchOptions
  ): Promise<CatalogPage[] | null> {
    return this.fetchJson<CatalogPage[]>(apiUrls.catalog(board), opts);
  }

  /**
   * Fetch the list of archived thread IDs for a board.
   * Not all boards have archives — returns an empty array for those.
   *
   * Endpoint: `GET https://a.4cdn.org/<board>/archive.json`
   */
  async getArchive(board: string): Promise<number[]> {
    const data = await this.fetchJson<number[]>(apiUrls.archive(board));
    return data ?? [];
  }

  /**
   * Fetch a single index page (threads + preview replies).
   * Pages are 1-based. Returns `null` on HTTP 304.
   *
   * Endpoint: `GET https://a.4cdn.org/<board>/<page>.json`
   */
  async getIndex(
    board: string,
    page: number,
    opts?: FetchOptions
  ): Promise<IndexPage | null> {
    const data = await this.fetchJson<{ threads: IndexPage }>(
      apiUrls.index(board, page),
      opts
    );
    if (data === null) return null;
    return data.threads;
  }

  /**
   * Fetch a full thread (all posts).
   * Returns `null` on HTTP 304.
   *
   * Endpoint: `GET https://a.4cdn.org/<board>/thread/<threadId>.json`
   */
  async getThread(
    board: string,
    threadId: number,
    opts?: FetchOptions
  ): Promise<Thread | null> {
    return this.fetchJson<Thread>(apiUrls.thread(board, threadId), opts);
  }
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class FourChanApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string
  ) {
    super(`4chan API error ${status} for ${url}`);
    this.name = "FourChanApiError";
  }
}
