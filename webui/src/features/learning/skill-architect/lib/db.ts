// src/features/learning/skill-architect/lib/db.ts
/**
 * File-backed storage for generated skill trees, scoped by owner username.
 * Each tree lives in its own file under data/skill-architect/<id>.json so
 * concurrent users never contend for a single shared file. Missing/corrupt
 * files degrade gracefully to empty results.
 */
import { promises as fs } from "fs";
import path from "path";
import {
  SkillArchitectTreeSchema,
  type SkillArchitectTree,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data", "skill-architect");

function treeFile(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

async function readTreeFile(id: string): Promise<SkillArchitectTree | null> {
  try {
    const data = await fs.readFile(treeFile(id), "utf8");
    const parsed = SkillArchitectTreeSchema.safeParse(JSON.parse(data) as unknown);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function writeTreeFile(tree: SkillArchitectTree): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(treeFile(tree.id), JSON.stringify(tree, null, 2), "utf8");
}

export async function listTreeFiles(owner: string): Promise<SkillArchitectTree[]> {
  let names: string[];
  try {
    names = await fs.readdir(DATA_DIR);
  } catch {
    return [];
  }

  const trees: SkillArchitectTree[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const tree = await readTreeFile(name.replace(/\.json$/, ""));
    if (tree && tree.owner === owner) trees.push(tree);
  }
  return trees.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getTree(id: string, owner: string): Promise<SkillArchitectTree | null> {
  const tree = await readTreeFile(id);
  if (!tree || tree.owner !== owner) return null;
  return tree;
}

export async function saveTree(tree: SkillArchitectTree): Promise<SkillArchitectTree> {
  await writeTreeFile(tree);
  return tree;
}

export async function deleteTreeFile(id: string, owner: string): Promise<boolean> {
  const tree = await readTreeFile(id);
  if (!tree || tree.owner !== owner) return false;
  try {
    await fs.unlink(treeFile(id));
    return true;
  } catch {
    return false;
  }
}
