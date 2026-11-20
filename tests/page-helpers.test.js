// Tests for the shared page building blocks (src/page-helpers.js).
import { describe, it, expect } from "vitest";
import { escape, md, table } from "../src/page-helpers.js";

describe("page helpers", () => {
  it("escape: dictionary text can't break the page", () => {
    expect(escape(`<b>"Tom & Jerry"</b>`)).toBe("&lt;b&gt;&quot;Tom &amp; Jerry&quot;&lt;/b&gt;");
    expect(escape("c'è")).toBe("c'è");
  });

  it("md: **bold** and *italic*, after escaping", () => {
    expect(md("**Spelling** — *tu cerchi* & co")).toBe("<strong>Spelling</strong> — <em>tu cerchi</em> &amp; co");
    expect(md("<script>")).toBe("&lt;script&gt;");
  });

  it("table: head, plain rows and rows with attributes", () => {
    const html = table("words", ["Italian", "English"], [
      ["<td>io</td>", "<td>I</td>"],
      { attrs: ' class="r5"', cells: ["<td>tu</td>", "<td>you</td>"] },
    ]);
    expect(html).toContain('<table class="words">');
    expect(html).toContain("<th>Italian</th><th>English</th>");
    expect(html).toContain("<tr><td>io</td><td>I</td></tr>");
    expect(html).toContain('<tr class="r5"><td>tu</td><td>you</td></tr>');
    expect(table("conj", null, [])).not.toContain("<thead>");
  });
});
