// src/features/pages/types/page.ts
/**
 * Type definitions for Page entities in the dashboard.
 * Defines the structure for page metadata used in navigation cards.
 */

export interface Page {
  /** Unique identifier for the page */
  id: string;
  /** Display title of the page */
  title: string;
  /** Brief description of page functionality */
  description: string;
  /** Route path to navigate to */
  href: string;
  /** Logical grouping/category (e.g., "Analytics", "Settings") */
  category: string;
  /** Searchable tags for filtering */
  tags: string[];
}