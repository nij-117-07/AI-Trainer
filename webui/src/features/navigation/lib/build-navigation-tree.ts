// src/features/navigation/lib/build-navigation-tree.ts
/**
 * Transforms flat page data into a hierarchical navigation tree.
 * Normalizes paths and creates intermediate nodes for nested routes.
 * Automatically sorts all children alphabetically by title (A-Z).
 */

import { NavigationNode, PageData } from "../types";

/**
 * Recursively sorts all children nodes alphabetically by title.
 * Ensures consistent A-Z ordering across the entire navigation tree.
 */
function sortNodeChildren(node: NavigationNode): void {
  node.children.sort((a, b) => a.title.localeCompare(b.title));
  node.children.forEach(sortNodeChildren);
}

/**
 * Builds a hierarchical navigation tree from flat page data.
 * @param pages - Array of page definitions from db.json
 * @returns Root navigation node containing sorted nested children
 */
export function buildNavigationTree(pages: PageData[]): NavigationNode {
  const root: NavigationNode = {
    id: "root",
    title: "Root",
    description: "",
    href: "/",
    segment: "",
    children: [],
  };

  // Normalize paths to ensure consistent tree building
  const normalizedPages = pages.map((page) => ({
    ...page,
    normalizedHref: page.href.startsWith("/") ? page.href : `/${page.href}`,
  }));

  for (const page of normalizedPages) {
    const segments = page.normalizedHref.split("/").filter(Boolean);
    let current = root;
    let accumulatedPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      accumulatedPath += `/${segment}`;

      let child = current.children.find((c) => c.segment === segment);

      if (!child) {
        // Check if this specific path exists as a page entry
        const pageInfo = normalizedPages.find(
          (p) => p.normalizedHref === accumulatedPath
        );

        child = {
          id: pageInfo?.id || `generated-${accumulatedPath}`,
          title:
            pageInfo?.title ||
            segment.charAt(0).toUpperCase() + segment.slice(1),
          description: pageInfo?.description || "",
          href: accumulatedPath,
          segment,
          category: pageInfo?.category,
          tags: pageInfo?.tags,
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  // Sort entire tree alphabetically by title (A-Z)
  sortNodeChildren(root);
  return root;
}