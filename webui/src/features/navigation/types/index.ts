// src/features/navigation/types/index.ts
/**
 * Type definitions for the hierarchical navigation system.
 * Supports recursive tree structures derived from flat page manifests.
 */

export interface PageData {
  /** Unique identifier for the page */
  id: string;
  /** Display title for navigation */
  title: string;
  /** Tooltip/description for hover states */
  description: string;
  /** Route path (may or may not include leading slash) */
  href: string;
  /** Top-level categorization (e.g., Learning, Tool) */
  category: string;
  /** Searchable tags */
  tags: string[];
}

export interface NavigationNode {
  /** Node identifier (inherited from PageData or generated from path) */
  id: string;
  /** Display label */
  title: string;
  /** Description text */
  description: string;
  /** Full resolved href path */
  href: string;
  /** URL segment for this node (e.g., "learning" from /learning/tutor) */
  segment: string;
  /** Optional category metadata */
  category?: string;
  /** Optional tags for filtering */
  tags?: string[];
  /** Recursive child nodes */
  children: NavigationNode[];
}

export interface Identity {
  /** Unique username displayed in UI */
  username: string;
  /** User email address for contact/display purposes */
  email?: string;
  /** Authorization groups/roles determining access levels */
  groups: string[];
}