/**
 * Options for performing a shallow clone of a git repository.
 * Used when cloning a repository with limited history to save bandwidth and storage.
 */
export type ShallowCloneOptions = {
  /** The URL of the repository to clone. */
  url: string;
  /** The local directory where the repository should be cloned. */
  directory: string;
  /** Whether to clone only a single branch (implied true if depth is set usually, but explicit here). */
  singleBranch?: boolean;
  /** The number of commits to fetch. 1 for a shallow clone. */
  depth?: number;
  /** The specific branch to clone. */
  branch?: string;
};

/**
 * Represents a single git commit log entry.
 */
export type CommitItem = {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
};

