// Tests for the German verbs (dictionary/de/verbs-*.csv, src/lang/de/conjugate.js).
// Expected forms are written from German grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import { VERB_FILES, verbs } from "../../src/lang/de/verbs.js";
import { form, perfekt, participle, cardsFor } from "../../src/lang/de/conjugate.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const verb = (inf) => {
  const v = verbs.find((x) => x.infinitive === inf);
  if (!v) throw new Error(`${inf} is not in dictionary/de`);
  return v;
};
const six = (inf, tense) => [0, 1, 2, 3, 4, 5].map((p) => form(verb(inf), tense, p));
const imperative = (inf) => [1, 4, 5].map((p) => form(verb(inf), "imperativ", p));

const RULE_COLUMNS = ["infinitive", "english", "auxiliary", "en_base", "en_past", "impersonal", "note", "imperativ"];
const COLUMNS = {
  "verbs-regular.csv": RULE_COLUMNS,
  "verbs-irregular.csv": ["infinitive", "english", "auxiliary", "stem2", "past", "participle", "en_base", "en_past", "en_presente", "note", "imperativ"],
  "verbs-separable.csv": ["infinitive", "prefix", "english", "auxiliary", "stem2", "past", "participle", "en_base", "en_past", "note", "imperativ"],
  "verbs-modal.csv": ["infinitive", "english", "auxiliary", "participle", "praesens", "praeteritum", "konjunktiv", "imperativ", "en_base", "en_past", "en_presente", "en_konjunktiv", "note"],
};

describe("dictionary/de/verbs-*.csv", () => {
  it.each(Object.keys(VERB_FILES))("%s has the expected columns", (file) => {
    expectCsvShape(VERB_FILES[file].text, COLUMNS[file]);
  });

  it.each(verbs.map((v) => [v.infinitive, v]))("%s is valid", (_, v) => {
    expect(["haben", "sein", "sein/haben"]).toContain(v.auxiliary);
    expect(v.en_base).toMatch(/\S/);
    expect(v.en_past).toMatch(/\S/);
    expect(v.infinitive).toMatch(/n$/);
    expectNoteMarkdown(v.note);
    if (v.group === "irregular") {
      expect(v.past, "Präteritum").toMatch(/\S/);
      expect(v.participle, "participle").toMatch(/n$|t$/); // gesprochen, getan, gebracht
    }
    if (v.group === "separable") expect(v.infinitive.startsWith(v.prefix) && v.prefix.length > 0).toBe(true);
    if (v.group === "modal") {
      for (const t of ["praesens", "praeteritum", "konjunktiv"]) if (v[t]) expect(v[t].split(";"), t).toHaveLength(6);
      if (v.imperativ) expect(v.imperativ.split(";")).toHaveLength(3);
    }
    for (const col of ["en_past", "en_presente"]) if (v[col]?.includes(";")) expect(v[col].split(";"), col).toHaveLength(6);
  });

  it("lists each verb once", () => {
    const names = verbs.map((v) => v.infinitive);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
  });

  it("gives each verb its own English, so English-first cards have one answer", () => {
    const bases = verbs.map((v) => v.en_base);
    expect(bases.filter((x, i) => bases.indexOf(x) !== i)).toEqual([]);
  });
});

describe("regular verbs", () => {
  it("machen: stem + endings, -te, ge-…-t", () => {
    expect(six("machen", "praesens")).toEqual(["mache", "machst", "macht", "machen", "macht", "machen"]);
    expect(six("machen", "praeteritum")).toEqual(["machte", "machtest", "machte", "machten", "machtet", "machten"]);
    expect(six("machen", "perfekt")).toEqual(["habe gemacht", "hast gemacht", "hat gemacht", "haben gemacht", "habt gemacht", "haben gemacht"]);
    expect(six("machen", "konjunktiv")[0]).toBe("würde machen");
    expect(imperative("machen")).toEqual(["mach", "macht", "machen Sie"]);
  });

  it("an extra e after -t, -d and consonant + n", () => {
    expect(six("arbeiten", "praesens")).toEqual(["arbeite", "arbeitest", "arbeitet", "arbeiten", "arbeitet", "arbeiten"]);
    expect(six("arbeiten", "praeteritum")[0]).toBe("arbeitete");
    expect(participle(verb("arbeiten"))).toBe("gearbeitet");
    expect(six("öffnen", "praesens").slice(1, 3)).toEqual(["öffnest", "öffnet"]);
    expect(six("reden", "praesens").slice(1, 3)).toEqual(["redest", "redet"]);
    expect(imperative("warten")[0]).toBe("warte");
  });

  it("a stem in -s, -ß, -z only adds -t for du", () => {
    expect(form(verb("tanzen"), "praesens", 1)).toBe("tanzt");
    expect(form(verb("reisen"), "praesens", 1)).toBe("reist");
    expect(form(verb("putzen"), "praesens", 1)).toBe("putzt");
  });

  it("-ern verbs keep the e: ich feiere, wir feiern", () => {
    expect(six("feiern", "praesens")).toEqual(["feiere", "feierst", "feiert", "feiern", "feiert", "feiern"]);
    expect(participle(verb("wandern"))).toBe("gewandert");
  });

  it("no ge- after be-, er-, ver-, ge- or in -ieren verbs", () => {
    expect(participle(verb("bezahlen"))).toBe("bezahlt");
    expect(participle(verb("erklären"))).toBe("erklärt");
    expect(participle(verb("versuchen"))).toBe("versucht");
    expect(participle(verb("gehören"))).toBe("gehört");
    expect(participle(verb("studieren"))).toBe("studiert");
    expect(perfekt(verb("passieren"), 2)).toBe("ist passiert");
  });

  // The rule drops ge- for verbs that start with be-, er-, ver-, ge-… or end in
  // -ieren, but some verbs only look like that (beten → gebetet, erben → geerbt).
  // So every verb the rule gives no ge- is checked here by hand.
  it("every participle without ge- is checked by hand", () => {
    const checked = {
      bezahlen: "bezahlt", besuchen: "besucht", erzählen: "erzählt", erklären: "erklärt", versuchen: "versucht",
      studieren: "studiert", gehören: "gehört", telefonieren: "telefoniert", benutzen: "benutzt", passieren: "passiert",
    };
    for (const v of verbs.filter((x) => x.group !== "modal" && !x.participle)) {
      const stem = v.infinitive.slice((v.prefix ?? "").length).replace(/e?n$/, "");
      if (!participle(v).startsWith(`${v.prefix ?? ""}ge${stem}`)) expect(checked, `${v.infinitive} → ${participle(v)}: check it and add it here`).toHaveProperty(v.infinitive, participle(v));
    }
  });

  it("impersonal verbs only have the es form", () => {
    const cards = cardsFor(verb("regnen")).map((c) => c.it);
    expect(cards).toEqual(["regnen", "es regnet", "es hat geregnet", "es regnete", "es würde regnen"]);
  });
});

describe("irregular verbs", () => {
  it("e → i / ie for du and er, also in the du imperative", () => {
    expect(six("sprechen", "praesens")).toEqual(["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"]);
    expect(imperative("sprechen")).toEqual(["sprich", "sprecht", "sprechen Sie"]);
    expect(six("sehen", "praesens").slice(0, 3)).toEqual(["sehe", "siehst", "sieht"]);
    expect(six("nehmen", "praesens").slice(1, 3)).toEqual(["nimmst", "nimmt"]);
    expect(six("lesen", "praesens").slice(1, 3)).toEqual(["liest", "liest"]);
    expect(six("essen", "praesens").slice(1, 3)).toEqual(["isst", "isst"]);
    expect(imperative("geben")[0]).toBe("gib");
    expect(imperative("lesen")[0]).toBe("lies");
  });

  it("a → ä, au → äu for du and er, but not in the imperative", () => {
    expect(six("fahren", "praesens")).toEqual(["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"]);
    expect(imperative("fahren")[0]).toBe("fahr");
    expect(six("laufen", "praesens").slice(1, 3)).toEqual(["läufst", "läuft"]);
    expect(six("halten", "praesens")).toEqual(["halte", "hältst", "hält", "halten", "haltet", "halten"]);
    expect(six("lassen", "praesens").slice(1, 3)).toEqual(["lässt", "lässt"]);
  });

  it("Präteritum: no ending for ich and er, -est/-et after -t, -d, -s, -ß", () => {
    expect(six("sprechen", "praeteritum")).toEqual(["sprach", "sprachst", "sprach", "sprachen", "spracht", "sprachen"]);
    expect(six("finden", "praeteritum")).toEqual(["fand", "fandest", "fand", "fanden", "fandet", "fanden"]);
    expect(six("essen", "praeteritum").slice(0, 2)).toEqual(["aß", "aßest"]);
    expect(six("gehen", "praeteritum")[3]).toBe("gingen");
  });

  it("mixed verbs: changed vowel with the regular endings", () => {
    expect(six("bringen", "praeteritum")).toEqual(["brachte", "brachtest", "brachte", "brachten", "brachtet", "brachten"]);
    expect(six("denken", "perfekt")[0]).toBe("habe gedacht");
  });

  it("sein in the Perfekt for movement and change", () => {
    for (const v of ["gehen", "kommen", "fahren", "fliegen", "laufen", "bleiben", "fallen", "sterben", "reisen", "aufstehen", "ankommen", "werden", "sein"]) {
      expect(perfekt(verb(v), 0), v).toMatch(/^bin /);
    }
    expect(perfekt(verb("essen"), 0)).toBe("habe gegessen");
  });
});

describe("separable verbs", () => {
  it("the prefix goes to the end, ge goes inside the participle", () => {
    expect(six("anrufen", "praesens")).toEqual(["rufe an", "rufst an", "ruft an", "rufen an", "ruft an", "rufen an"]);
    expect(six("anrufen", "praeteritum")[0]).toBe("rief an");
    expect(six("anrufen", "perfekt")[0]).toBe("habe angerufen");
    expect(six("anrufen", "konjunktiv")[0]).toBe("würde anrufen");
    expect(imperative("anrufen")).toEqual(["ruf an", "ruft an", "rufen Sie an"]);
  });

  it("weak separable verbs follow the regular rules", () => {
    expect(participle(verb("einkaufen"))).toBe("eingekauft");
    expect(six("einkaufen", "praeteritum")[0]).toBe("kaufte ein");
    expect(participle(verb("kennenlernen"))).toBe("kennengelernt");
  });

  it("strong separable verbs keep the vowel change", () => {
    expect(six("anfangen", "praesens").slice(1, 3)).toEqual(["fängst an", "fängt an"]);
    expect(six("fernsehen", "praesens")[2]).toBe("sieht fern");
    expect(six("einladen", "praesens").slice(1, 3)).toEqual(["lädst ein", "lädt ein"]);
    expect(perfekt(verb("aufstehen"), 2)).toBe("ist aufgestanden");
  });
});

describe("auxiliary and modal verbs", () => {
  it("sein, haben, werden", () => {
    expect(six("sein", "praesens")).toEqual(["bin", "bist", "ist", "sind", "seid", "sind"]);
    expect(six("haben", "praesens")).toEqual(["habe", "hast", "hat", "haben", "habt", "haben"]);
    expect(six("werden", "praesens")).toEqual(["werde", "wirst", "wird", "werden", "werdet", "werden"]);
    expect(six("sein", "praeteritum")).toEqual(["war", "warst", "war", "waren", "wart", "waren"]);
    expect(six("haben", "konjunktiv")[0]).toBe("hätte");
    expect(six("sein", "konjunktiv")[0]).toBe("wäre");
  });

  it("modals: ich and er alike, no umlaut in the Präteritum, umlaut in the Konjunktiv", () => {
    const presents = { können: "kann", müssen: "muss", wollen: "will", sollen: "soll", dürfen: "darf", mögen: "mag", wissen: "weiß" };
    for (const [inf, f] of Object.entries(presents)) {
      const forms = six(inf, "praesens");
      expect([forms[0], forms[2]], inf).toEqual([f, f]);
      expect(forms[3], inf).toBe(inf);
      expect(six(inf, "praeteritum")[0], inf).not.toMatch(/[äöü]/);
    }
    expect(six("können", "konjunktiv")[0]).toBe("könnte");
    expect(six("müssen", "konjunktiv")[0]).toBe("müsste");
    expect(six("mögen", "konjunktiv")[0]).toBe("möchte");
    expect(six("dürfen", "praeteritum")[0]).toBe("durfte");
  });
});

describe("cards", () => {
  it("say the person and give the English", () => {
    const cards = cardsFor(verb("arbeiten"));
    const pair = (id) => { const c = cards.find((x) => x.id === id); return `${c.it} = ${c.en}`; };
    expect(pair("arbeiten.infinitiv")).toBe("arbeiten = to work");
    expect(pair("arbeiten.praesens.2")).toBe("er/sie/es arbeitet = he/she/it works");
    expect(pair("arbeiten.perfekt.0")).toBe("ich habe gearbeitet = I worked");
    expect(pair("arbeiten.imperativ.5")).toBe("arbeiten Sie! = work! (polite)");
    const muss = cardsFor(verb("müssen")).find((c) => c.id === "müssen.praesens.2");
    expect(muss.en).toBe("he/she/it has to");
  });

  it("leave out forms that aren't used", () => {
    expect(cardsFor(verb("können")).some((c) => c.form === "perfekt")).toBe(false); // konnte instead
    expect(cardsFor(verb("heißen")).some((c) => c.form === "imperativ")).toBe(false);
    expect(cardsFor(verb("wollen")).some((c) => c.form === "konjunktiv")).toBe(false); // = Präteritum
  });

  it("have unique ids", () => {
    const ids = verbs.flatMap(cardsFor).map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});
