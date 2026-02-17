type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type PathToken = string | number;

const DELETE = Symbol("DELETE");

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
    if (!tokens) return node;

    const resolved = getByTokens(input, tokens);
    return resolved !== undefined ? resolved : DELETE;
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
