// src/features/rss/lib/xml-tree.ts
/**
 * Small dependency-free XML reader for feed documents. React Native has no DOM, so this builds a
 * plain element tree (name, attributes, children, and text with CDATA merged in). It skips the XML
 * declaration, comments, processing instructions, and DOCTYPE, and throws on broken nesting.
 */

export interface XmlElement {
  name: string;
  attrs: Record<string, string>;
  children: XmlElement[];
  text: string;
}

const NAMED_ENTITIES = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
]);
const ENTITY_PATTERN = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g;
const OPEN_TAG_PATTERN = /<([^\s/>!?]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/y;
const ATTRIBUTE_PATTERN = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

export function decodeEntities(value: string): string {
  return value.replace(ENTITY_PATTERN, (match: string, body: string) => {
    if (body.charAt(0) === "#") {
      const code = body.charAt(1) === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES.get(body) ?? match;
  });
}

export function parseXmlTree(xml: string): XmlElement {
  const root: XmlElement = { name: "", attrs: {}, children: [], text: "" };
  const stack: XmlElement[] = [root];
  let position = 0;
  while (position < xml.length) {
    const next = xml.indexOf("<", position);
    const textEnd = next === -1 ? xml.length : next;
    if (textEnd > position) currentElement(stack).text += decodeEntities(xml.slice(position, textEnd));
    if (next === -1) break;
    position = readMarkup(xml, next, stack);
  }
  if (stack.length > 1) throw new Error(`Unclosed element <${currentElement(stack).name}>.`);
  return root;
}

function currentElement(stack: XmlElement[]): XmlElement {
  return stack[stack.length - 1];
}

function readMarkup(xml: string, start: number, stack: XmlElement[]): number {
  if (xml.startsWith("<!--", start)) return skipPast(xml, start + 4, "-->");
  if (xml.startsWith("<![CDATA[", start)) {
    const end = xml.indexOf("]]>", start + 9);
    if (end === -1) throw new Error("Unterminated CDATA section.");
    currentElement(stack).text += xml.slice(start + 9, end);
    return end + 3;
  }
  if (xml.startsWith("<?", start)) return skipPast(xml, start + 2, "?>");
  if (xml.startsWith("<!", start)) return skipDeclaration(xml, start);
  if (xml.startsWith("</", start)) return closeElement(xml, start, stack);
  return openElement(xml, start, stack);
}

function skipPast(xml: string, from: number, terminator: string): number {
  const end = xml.indexOf(terminator, from);
  if (end === -1) throw new Error(`Missing ${terminator}.`);
  return end + terminator.length;
}

function skipDeclaration(xml: string, start: number): number {
  const close = xml.indexOf(">", start);
  if (close === -1) throw new Error("Unterminated declaration.");
  const bracket = xml.indexOf("[", start);
  if (bracket !== -1 && bracket < close) return skipPast(xml, bracket, "]>");
  return close + 1;
}

function closeElement(xml: string, start: number, stack: XmlElement[]): number {
  const end = xml.indexOf(">", start);
  if (end === -1) throw new Error("Unterminated closing tag.");
  const name = xml.slice(start + 2, end).trim();
  if (stack.length === 1) throw new Error(`Unexpected closing tag </${name}>.`);
  const open = stack.pop();
  if (!open || open.name !== name) throw new Error(`Mismatched closing tag </${name}>.`);
  return end + 1;
}

function openElement(xml: string, start: number, stack: XmlElement[]): number {
  OPEN_TAG_PATTERN.lastIndex = start;
  const match = OPEN_TAG_PATTERN.exec(xml);
  if (!match) throw new Error(`Malformed tag at position ${start}.`);
  const element: XmlElement = {
    name: match[1] ?? "",
    attrs: parseAttributes(match[2] ?? ""),
    children: [],
    text: "",
  };
  currentElement(stack).children.push(element);
  if (match[3] !== "/") stack.push(element);
  return OPEN_TAG_PATTERN.lastIndex;
}

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  source.replace(ATTRIBUTE_PATTERN, (_match: string, name: string, doubleQuoted?: string, singleQuoted?: string) => {
    attrs[name] = decodeEntities(doubleQuoted ?? singleQuoted ?? "");
    return "";
  });
  return attrs;
}
