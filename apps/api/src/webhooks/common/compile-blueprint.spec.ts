import { compileBlueprint } from "./compile-blueprint";

describe("compileBlueprint", () => {
  it("parses string blueprint JSON and replaces mapped values", () => {
    const input = {
      event: { type: "created" },
      webhook: { enabled: true },
    };

    const result = compileBlueprint(input, '{"kind":"$event.type","enabled":"$webhook.enabled"}');

    expect(result).toEqual({
      kind: "created",
      enabled: true,
    });
  });

  it("resolves nested array index paths", () => {
    const input = {
      records: [{ id: "first" }, { id: "second" }],
    };

    const result = compileBlueprint(input, {
      selected: "$records[1].id",
    });

    expect(result).toEqual({ selected: "second" });
  });

  it("deletes unresolved object keys and array items", () => {
    const input = {
      user: { name: "philip" },
    };

    const result = compileBlueprint(input, {
      keep: "$user.name",
      remove: "$user.email",
      list: ["$user.name", "$user.email", "static"],
    });

    expect(result).toEqual({
      keep: "philip",
      list: ["philip", "static"],
    });
  });

  it("keeps malformed or non-path strings unchanged", () => {
    const input = {
      event: { type: "created" },
    };

    const result = compileBlueprint(input, {
      malformed: "$event..type",
      rootOnly: "$",
      plain: "hello",
      valid: "$event.type",
    });

    expect(result).toEqual({
      malformed: "$event..type",
      rootOnly: "$",
      plain: "hello",
      valid: "created",
    });
  });

  it("interpolates multiple embedded paths inside a single string", () => {
    const input = {
      movie: {
        title: "Alien",
        year: 1979,
      },
    };

    const result = compileBlueprint(input, {
      message: "$movie.title $movie.year",
      wrapped: "Now playing: $movie.title ($movie.year)",
      list: ["Title: $movie.title", "$movie.title ($movie.year)"],
    });

    expect(result).toEqual({
      message: "Alien 1979",
      wrapped: "Now playing: Alien (1979)",
      list: ["Title: Alien", "Alien (1979)"],
    });
  });

  it("throws when blueprint string is invalid JSON", () => {
    expect(() => compileBlueprint({}, "{")).toThrow(SyntaxError);
  });
});
