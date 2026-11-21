// Tests for the French verbs (dictionary/fr/verbs-*.csv, src/lang/fr/conjugate.js).
// Expected forms are written from French grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import { VERB_FILES, verbs } from "../../src/lang/fr/verbs.js";
import { form, participle, cardsFor, withPronoun } from "../../src/lang/fr/conjugate.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const verb = (inf) => {
  const v = verbs.find((x) => x.infinitive === inf);
  if (!v) throw new Error(`${inf} is not in dictionary/fr`);
  return v;
};
const six = (inf, tense) => [0, 1, 2, 3, 4, 5].map((p) => form(verb(inf), tense, p));
const imperative = (inf) => [1, 3, 4].map((p) => form(verb(inf), "imperatif", p));

const COLUMNS = {
  "verbs-er.csv": ["infinitive", "english", "auxiliary", "stem2", "en_base", "en_past", "note"],
  "verbs-ir.csv": ["infinitive", "english", "auxiliary", "en_base", "en_past", "note"],
  "verbs-re.csv": ["infinitive", "english", "auxiliary", "en_base", "en_past", "note"],
  "verbs-irregular.csv": ["infinitive", "english", "auxiliary", "participle", "present", "futur", "imparfait", "imperatif", "en_base", "en_past", "en_present", "en_conditional", "impersonal", "note"],
};

describe("dictionary/fr/verbs-*.csv", () => {
  it.each(Object.keys(VERB_FILES))("%s has the expected columns", (file) => {
    expectCsvShape(VERB_FILES[file].text, COLUMNS[file]);
  });

  it.each(verbs.map((v) => [v.infinitive, v]))("%s is valid", (_, v) => {
    expect(["avoir", "être"]).toContain(v.auxiliary);
    expect(v.en_base).toMatch(/\S/);
    expect(v.en_past).toMatch(/\S/);
    expectNoteMarkdown(v.note);
    const ending = { er: /er$/, ir: /ir$/, re: /re$/, irregular: /(er|ir|re|oir)$/ }[v.group];
    expect(v.infinitive).toMatch(ending);
    if (v.group === "irregular") {
      expect(v.present.split(";"), "present").toHaveLength(6);
      expect(v.futur, "future stem").toMatch(/r$/);
      expect(v.participle).toMatch(/\S/);
    }
    for (const col of ["en_past", "en_present"]) if (v[col]?.includes(";")) expect(v[col].split(";"), col).toHaveLength(6);
  });

  it("lists each verb once, each with its own English", () => {
    const names = verbs.map((v) => v.infinitive);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
    const bases = verbs.map((v) => v.en_base);
    expect(bases.filter((x, i) => bases.indexOf(x) !== i)).toEqual([]);
  });
});

describe("regular verbs", () => {
  it("parler: -e, -es, -e, -ons, -ez, -ent and the other tenses", () => {
    expect(six("parler", "present")).toEqual(["parle", "parles", "parle", "parlons", "parlez", "parlent"]);
    expect(six("parler", "passe")).toEqual(["ai parlé", "as parlé", "a parlé", "avons parlé", "avez parlé", "ont parlé"]);
    expect(six("parler", "imparfait")).toEqual(["parlais", "parlais", "parlait", "parlions", "parliez", "parlaient"]);
    expect(six("parler", "futur")).toEqual(["parlerai", "parleras", "parlera", "parlerons", "parlerez", "parleront"]);
    expect(six("parler", "conditionnel")[0]).toBe("parlerais");
    expect(imperative("parler")).toEqual(["parle", "parlons", "parlez"]); // no -s for tu
  });

  it("finir: -iss- in the plural and the imparfait", () => {
    expect(six("finir", "present")).toEqual(["finis", "finis", "finit", "finissons", "finissez", "finissent"]);
    expect(six("finir", "imparfait")[0]).toBe("finissais");
    expect(six("finir", "futur")[0]).toBe("finirai");
    expect(participle(verb("finir"))).toBe("fini");
  });

  it("vendre: no ending for il, the future drops the e, the participle in -u", () => {
    expect(six("vendre", "present")).toEqual(["vends", "vends", "vend", "vendons", "vendez", "vendent"]);
    expect(six("vendre", "futur")[0]).toBe("vendrai");
    expect(participle(verb("vendre"))).toBe("vendu");
  });

  it("ç and ge before a and o", () => {
    expect(six("commencer", "present")[3]).toBe("commençons");
    expect(six("commencer", "imparfait").slice(2, 4)).toEqual(["commençait", "commencions"]);
    expect(six("manger", "present")[3]).toBe("mangeons");
    expect(six("manger", "imparfait")[0]).toBe("mangeais");
    expect(six("voyager", "imparfait")[3]).toBe("voyagions");
  });

  it("è, ll and i before a silent ending, also in the future", () => {
    expect(six("acheter", "present")).toEqual(["achète", "achètes", "achète", "achetons", "achetez", "achètent"]);
    expect(six("acheter", "futur")[0]).toBe("achèterai");
    expect(six("appeler", "present").slice(0, 4)).toEqual(["appelle", "appelles", "appelle", "appelons"]);
    expect(six("appeler", "futur")[0]).toBe("appellerai");
    expect(six("payer", "present").slice(3, 6)).toEqual(["payons", "payez", "paient"]);
    expect(six("payer", "futur")[0]).toBe("paierai");
    expect(imperative("acheter")[0]).toBe("achète");
  });

  it("é → è only in the present: je préfère, je préférerai", () => {
    expect(six("préférer", "present").slice(2, 5)).toEqual(["préfère", "préférons", "préférez"]);
    expect(six("préférer", "futur")[0]).toBe("préférerai");
    expect(six("espérer", "present")[0]).toBe("espère");
  });
});

describe("the passé composé", () => {
  it("être for movement and change, with agreement", () => {
    expect(six("aller", "passe")).toEqual(["suis allé(e)", "es allé(e)", "est allé(e)", "sommes allé(e)s", "êtes allé(e)s", "sont allé(e)s"]);
    for (const v of ["aller", "venir", "arriver", "partir", "sortir", "rester", "tomber", "entrer", "rentrer", "devenir", "revenir", "mourir", "naître", "descendre"]) {
      expect(verb(v).auxiliary, v).toBe("être");
    }
    expect(form(verb("être"), "passe", 0)).toBe("ai été");
  });

  it("irregular participles", () => {
    const expected = { être: "été", avoir: "eu", faire: "fait", prendre: "pris", mettre: "mis", voir: "vu", pouvoir: "pu", vouloir: "voulu", devoir: "dû", savoir: "su", venir: "venu", dire: "dit", écrire: "écrit", lire: "lu", boire: "bu", ouvrir: "ouvert", vivre: "vécu", mourir: "mort", naître: "né", connaître: "connu" };
    for (const [inf, p] of Object.entries(expected)) expect(participle(verb(inf)), inf).toBe(p);
  });

  it("j' before a vowel or a silent h", () => {
    expect(withPronoun(0, "ai parlé")).toBe("j'ai parlé");
    expect(withPronoun(0, "habite")).toBe("j'habite");
    expect(withPronoun(0, "suis allé(e)")).toBe("je suis allé(e)");
    expect(withPronoun(3, "avons")).toBe("nous avons");
  });
});

describe("irregular verbs", () => {
  it("être, avoir, aller, faire in the present", () => {
    expect(six("être", "present")).toEqual(["suis", "es", "est", "sommes", "êtes", "sont"]);
    expect(six("avoir", "present")).toEqual(["ai", "as", "a", "avons", "avez", "ont"]);
    expect(six("aller", "present")).toEqual(["vais", "vas", "va", "allons", "allez", "vont"]);
    expect(six("faire", "present")).toEqual(["fais", "fais", "fait", "faisons", "faites", "font"]);
  });

  it("the imparfait comes from the nous form; être has ét-", () => {
    expect(six("être", "imparfait")[0]).toBe("étais");
    expect(six("boire", "imparfait")[0]).toBe("buvais");
    expect(six("faire", "imparfait")[0]).toBe("faisais");
    expect(six("voir", "imparfait")[3]).toBe("voyions");
    expect(six("rire", "imparfait")[3]).toBe("riions");
  });

  it("irregular future stems, shared by the conditionnel", () => {
    const stems = { être: "ser", avoir: "aur", aller: "ir", faire: "fer", pouvoir: "pourr", vouloir: "voudr", devoir: "devr", savoir: "saur", venir: "viendr", voir: "verr", envoyer: "enverr", falloir: "faudr" };
    for (const [inf, s] of Object.entries(stems)) {
      expect(form(verb(inf), "futur", 2), inf).toBe(s + "a");
      expect(form(verb(inf), "conditionnel", 2), inf).toBe(s + "ait");
    }
  });

  it("imperatives: va, sois, aie, sache; the tu form drops -s after -es and -as", () => {
    expect(imperative("aller")).toEqual(["va", "allons", "allez"]);
    expect(imperative("être")).toEqual(["sois", "soyons", "soyez"]);
    expect(imperative("avoir")).toEqual(["aie", "ayons", "ayez"]);
    expect(imperative("savoir")[0]).toBe("sache");
    expect(imperative("ouvrir")[0]).toBe("ouvre");
    expect(imperative("prendre")).toEqual(["prends", "prenons", "prenez"]);
    expect(imperative("pouvoir")).toEqual([null, null, null]);
  });

  it("impersonal verbs: only il", () => {
    expect(cardsFor(verb("falloir")).map((c) => c.it)).toEqual(["falloir", "il faut", "il a fallu", "il fallait", "il faudra", "il faudrait"]);
    expect(form(verb("pleuvoir"), "present", 2)).toBe("pleut");
  });
});

describe("cards", () => {
  it("say the person and give the English", () => {
    const pair = (inf, id) => { const c = cardsFor(verb(inf)).find((x) => x.id === id); return `${c.it} = ${c.en}`; };
    expect(pair("parler", "parler.present.2")).toBe("il/elle parle = he/she speaks");
    expect(pair("aimer", "aimer.present.0")).toBe("j'aime = I love");
    expect(pair("aller", "aller.passe.3")).toBe("nous sommes allé(e)s = we went");
    expect(pair("vouloir", "vouloir.conditionnel.0")).toBe("je voudrais = I would like");
    expect(pair("parler", "parler.imperatif.3")).toBe("(nous) parlons ! = let's speak!");
  });

  it("have unique ids", () => {
    const ids = verbs.flatMap(cardsFor).map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});
