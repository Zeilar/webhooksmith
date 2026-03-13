type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type PathToken = string | number;

const DELETE = Symbol("DELETE");
const DOLLAR_PATH_PATTERN = /\$[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*|\[\d+\])*(?![A-Za-z0-9_.\[])/g;

function parseDollarPath(expr: string): PathToken[] | null {
  if (typeof expr !== "string" || !expr.startsWith("$")) return null;

  const s = expr.slice(1);
  if (!s) return null;

  const tokens: PathToken[] = [];
  let i = 0;

  const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
  const isIdentChar = (c: string) => /[A-Za-z0-9_]/.test(c);

  function readIdent(): string | null {
    if (i >= s.length || !isIdentStart(s[i])) return null;
    const start = i;
    i++;
    while (i < s.length && isIdentChar(s[i])) i++;
    return s.slice(start, i);
  }

  const first = readIdent();
  if (!first) return null;
  tokens.push(first);

  while (i < s.length) {
    const ch = s[i];

    if (ch === ".") {
      i++;
      const ident = readIdent();
      if (!ident) return null;
      tokens.push(ident);
      continue;
    }

    if (ch === "[") {
      i++;
      const start = i;
      while (i < s.length && /[0-9]/.test(s[i])) i++;
      if (start === i) return null;
      const num = Number(s.slice(start, i));
      if (i >= s.length || s[i] !== "]") return null;
      i++;
      tokens.push(num);
      continue;
    }

    return null;
  }

  return tokens;
}

function getByTokens(input: any, tokens: PathToken[]): any {
  let cur = input;
  for (const t of tokens) {
    if (cur == null) return undefined;
    cur = cur[t as any];
  }
  return cur;
}

function transform(node: any, input: any): any | typeof DELETE {
  // Replace "$..." strings; if unresolved => DELETE
  if (typeof node === "string") {
    const tokens = parseDollarPath(node);
    if (tokens) {
      const resolved = getByTokens(input, tokens);
      return resolved !== undefined ? resolved : DELETE;
    }

    const matches = [...node.matchAll(DOLLAR_PATH_PATTERN)];
    if (matches.length === 0) {
      return node;
    }

    let output = "";
    let lastIndex = 0;

    for (const match of matches) {
      const expr = match[0];
      const index = match.index ?? 0;
      const embeddedTokens = parseDollarPath(expr);
      if (!embeddedTokens) {
        continue;
      }
      const resolved = getByTokens(input, embeddedTokens);
      if (resolved === undefined) {
        return DELETE;
      }
      output += node.slice(lastIndex, index);
      output += typeof resolved === "string" ? resolved : JSON.stringify(resolved);
      lastIndex = index + expr.length;
    }

    output += node.slice(lastIndex);
    return output;
  }

  // Arrays: transform items; remove deleted items
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      const v = transform(node[i], input);
      if (v === DELETE) node.splice(i, 1);
      else node[i] = v;
    }
    return node;
  }

  // Objects: transform values; delete keys whose value is DELETE
  if (node && typeof node === "object") {
    for (const k of Object.keys(node)) {
      const v = transform(node[k], input);
      if (v === DELETE) delete node[k];
      else node[k] = v;
    }
    return node;
  }

  return node; // number/boolean/null
}

/**
 * Parses + mutates blueprint, replacing "$paths" with values from input.
 * If a "$path" can't be resolved, the property/array-element is removed.
 */
export function compileBlueprint(input: Record<string, any>, blueprint: string | Json): Json {
  const parsed: Json = typeof blueprint === "string" ? JSON.parse(blueprint) : blueprint;
  return transform(parsed, input) as Json;
}
