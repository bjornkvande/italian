// Correctness tests for the conjugation rules in src/conjugate.js.
// Expected forms are written out by hand from Italian grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import { verbs } from "../src/csv.js";
import {
  TENSES, form, participle, gerund, passatoProssimo, spellingNote, cardsFor,
} from "../src/conjugate.js";

const verb = (infinitive) => {
  const v = verbs.find((x) => x.infinitive === infinitive);
  if (!v) throw new Error(`${infinitive} is not in dictionary/verbs.csv`);
  return v;
};

// All six persons of one tense.
const row = (infinitive, tense) => [0, 1, 2, 3, 4, 5].map((p) => form(verb(infinitive), tense, p));

const cardsOf = (infinitive) => cardsFor(verb(infinitive));
const card = (infinitive, it) => cardsOf(infinitive).find((c) => c.it === it);

describe("model verbs: the full regular pattern for each group", () => {
  const MODELS = {
    parlare: {
      presente: ["parlo", "parli", "parla", "parliamo", "parlate", "parlano"],
      passato: ["ho parlato", "hai parlato", "ha parlato", "abbiamo parlato", "avete parlato", "hanno parlato"],
      imperfetto: ["parlavo", "parlavi", "parlava", "parlavamo", "parlavate", "parlavano"],
      futuro: ["parlerò", "parlerai", "parlerà", "parleremo", "parlerete", "parleranno"],
      condizionale: ["parlerei", "parleresti", "parlerebbe", "parleremmo", "parlereste", "parlerebbero"],
      imperativo: [null, "parla", "parli", "parliamo", "parlate", "parlino"],
    },
    credere: {
      presente: ["credo", "credi", "crede", "crediamo", "credete", "credono"],
      passato: ["ho creduto", "hai creduto", "ha creduto", "abbiamo creduto", "avete creduto", "hanno creduto"],
      imperfetto: ["credevo", "credevi", "credeva", "credevamo", "credevate", "credevano"],
      futuro: ["crederò", "crederai", "crederà", "crederemo", "crederete", "crederanno"],
      condizionale: ["crederei", "crederesti", "crederebbe", "crederemmo", "credereste", "crederebbero"],
      imperativo: [null, "credi", "creda", "crediamo", "credete", "credano"],
    },
    dormire: {
      presente: ["dormo", "dormi", "dorme", "dormiamo", "dormite", "dormono"],
      passato: ["ho dormito", "hai dormito", "ha dormito", "abbiamo dormito", "avete dormito", "hanno dormito"],
      imperfetto: ["dormivo", "dormivi", "dormiva", "dormivamo", "dormivate", "dormivano"],
      futuro: ["dormirò", "dormirai", "dormirà", "dormiremo", "dormirete", "dormiranno"],
      condizionale: ["dormirei", "dormiresti", "dormirebbe", "dormiremmo", "dormireste", "dormirebbero"],
      imperativo: [null, "dormi", "dorma", "dormiamo", "dormite", "dormano"],
    },
    capire: {
      presente: ["capisco", "capisci", "capisce", "capiamo", "capite", "capiscono"],
      passato: ["ho capito", "hai capito", "ha capito", "abbiamo capito", "avete capito", "hanno capito"],
      imperfetto: ["capivo", "capivi", "capiva", "capivamo", "capivate", "capivano"],
      futuro: ["capirò", "capirai", "capirà", "capiremo", "capirete", "capiranno"],
      condizionale: ["capirei", "capiresti", "capirebbe", "capiremmo", "capireste", "capirebbero"],
      imperativo: [null, "capisci", "capisca", "capiamo", "capite", "capiscano"],
    },
  };

  for (const [infinitive, tenses] of Object.entries(MODELS)) {
    for (const [tense, expected] of Object.entries(tenses)) {
      it(`${infinitive} — ${tense}`, () => {
        expect(row(infinitive, tense)).toEqual(expected);
      });
    }
  }
});

describe("-are spelling changes", () => {
  it("-care/-gare add h before e and i, nowhere else", () => {
    expect(row("cercare", "presente")).toEqual(["cerco", "cerchi", "cerca", "cerchiamo", "cercate", "cercano"]);
    expect(row("cercare", "futuro")[0]).toBe("cercherò");
    expect(row("cercare", "condizionale")[1]).toBe("cercheresti");
    expect(row("cercare", "imperativo")).toEqual([null, "cerca", "cerchi", "cerchiamo", "cercate", "cerchino"]);
    expect(row("cercare", "imperfetto")[0]).toBe("cercavo");
    expect(row("pagare", "presente")).toEqual(["pago", "paghi", "paga", "paghiamo", "pagate", "pagano"]);
    expect(row("pagare", "futuro")[0]).toBe("pagherò");
    expect(row("giocare", "presente")[1]).toBe("giochi");
    expect(row("dimenticare", "futuro")[3]).toBe("dimenticheremo");
  });

  it("-ciare/-giare drop the i before e and i", () => {
    expect(row("mangiare", "presente")).toEqual(["mangio", "mangi", "mangia", "mangiamo", "mangiate", "mangiano"]);
    expect(row("mangiare", "futuro")[0]).toBe("mangerò");
    expect(row("mangiare", "condizionale")[2]).toBe("mangerebbe");
    expect(row("mangiare", "imperativo")).toEqual([null, "mangia", "mangi", "mangiamo", "mangiate", "mangino"]);
    expect(row("mangiare", "imperfetto")[0]).toBe("mangiavo");
    expect(row("cominciare", "futuro")[0]).toBe("comincerò");
    expect(row("cominciare", "presente")[1]).toBe("cominci");
    expect(row("lasciare", "futuro")[0]).toBe("lascerò");
    expect(row("lasciare", "presente")[3]).toBe("lasciamo");
    expect(row("viaggiare", "futuro")[0]).toBe("viaggerò");
  });

  it("-iare never writes a double i, but keeps the i in futuro and condizionale", () => {
    expect(row("studiare", "presente")).toEqual(["studio", "studi", "studia", "studiamo", "studiate", "studiano"]);
    expect(row("studiare", "futuro")[0]).toBe("studierò");
    expect(row("studiare", "condizionale")[0]).toBe("studierei");
    expect(row("studiare", "imperativo")[5]).toBe("studino");
    expect(row("cambiare", "presente")[1]).toBe("cambi");
    expect(row("cambiare", "futuro")[0]).toBe("cambierò");
    expect(row("iniziare", "presente")[3]).toBe("iniziamo");
  });

  it("-eare (creare) is fully regular", () => {
    expect(row("creare", "presente")).toEqual(["creo", "crei", "crea", "creiamo", "create", "creano"]);
    expect(row("creare", "futuro")[0]).toBe("creerò");
    expect(row("creare", "imperativo")[5]).toBe("creino");
  });

  it("spelling notes only appear on verbs that change", () => {
    expect(spellingNote(verb("cercare"))).toMatch(/-care\/-gare/);
    expect(spellingNote(verb("mangiare"))).toMatch(/-ciare\/-giare/);
    expect(spellingNote(verb("studiare"))).toMatch(/tu studi\*, not \*studii/);
    expect(spellingNote(verb("parlare"))).toBe("");
    expect(spellingNote(verb("creare"))).toBe("");
    expect(spellingNote(verb("conoscere"))).toBe("");
  });
});

describe("participle and gerund", () => {
  it.each([
    ["parlare", "parlato"],
    ["credere", "creduto"],
    ["vendere", "venduto"],
    ["conoscere", "conosciuto"],
    ["riconoscere", "riconosciuto"],
    ["crescere", "cresciuto"],
    ["insistere", "insistito"],
    ["dormire", "dormito"],
    ["capire", "capito"],
  ])("%s → %s", (infinitive, expected) => {
    expect(participle(verb(infinitive))).toBe(expected);
  });

  it.each([
    ["parlare", "parlando"],
    ["mangiare", "mangiando"],
    ["credere", "credendo"],
    ["conoscere", "conoscendo"],
    ["dormire", "dormendo"],
    ["finire", "finendo"],
  ])("%s → %s", (infinitive, expected) => {
    expect(gerund(verb(infinitive))).toBe(expected);
  });
});

describe("passato prossimo: auxiliary and agreement", () => {
  it("essere verbs agree with the subject", () => {
    expect(row("arrivare", "passato")).toEqual([
      "sono arrivato/a", "sei arrivato/a", "è arrivato/a",
      "siamo arrivati/e", "siete arrivati/e", "sono arrivati/e",
    ]);
    expect(row("partire", "passato")[3]).toBe("siamo partiti/e");
  });

  it("verbs with both auxiliaries show both forms", () => {
    expect(row("finire", "passato")[0]).toBe("ho finito · sono finito/a");
    expect(row("finire", "passato")[5]).toBe("hanno finito · sono finiti/e");
    expect(passatoProssimo(verb("passare"), 2, " / ")).toBe("ha passato / è passato/a");
  });

  it("piovere has no agreement only in the impersonal 'it' form", () => {
    expect(row("piovere", "passato")[2]).toBe("ha piovuto · è piovuto");
    expect(row("piovere", "passato")[3]).toBe("abbiamo piovuto · siamo piovuti/e");
  });
});

describe("flash cards", () => {
  it("every regular verb has 1 infinitive + 5 tenses × 6 persons + 4 imperativo cards", () => {
    for (const v of verbs.filter((x) => !x.impersonal)) {
      expect(cardsFor(v), v.infinitive).toHaveLength(35);
    }
  });

  it("piovere only has 'it' cards, without imperativo", () => {
    expect(cardsOf("piovere").map((c) => [c.it, c.en])).toEqual([
      ["piovere", "to rain"],
      ["piove", "it rains"],
      ["ha piovuto / è piovuto", "it rained"],
      ["pioveva", "it used to rain"],
      ["pioverà", "it will rain"],
      ["pioverebbe", "it would rain"],
    ]);
  });

  it("no card has empty, undefined or null text", () => {
    for (const c of verbs.flatMap(cardsFor)) {
      for (const text of [c.tense, c.it, c.en]) {
        expect(text).toBeTruthy();
        expect(text).not.toMatch(/undefined|null|NaN/);
      }
    }
  });

  it("Italian side has the pronoun, English side the translation, per tense", () => {
    expect(card("parlare", "io parlo")).toEqual({ id: "parlare.presente.0", tenseKey: "presente", tense: "Presente", it: "io parlo", en: "I speak" });
    expect(card("parlare", "noi abbiamo parlato").en).toBe("we spoke");
    expect(card("parlare", "loro parlavano").en).toBe("they used to speak");
    expect(card("parlare", "voi parlerete").en).toBe("you all will speak");
    expect(card("parlare", "tu parleresti").en).toBe("you would speak");
    expect(card("arrivare", "lui/lei è arrivato/a").en).toBe("he/she arrived");
    expect(card("finire", "io ho finito / sono finito/a").en).toBe("I finished");
  });

  it("infinitive cards pair the verb with 'to' + its English base", () => {
    expect(card("parlare", "parlare")).toEqual({ id: "parlare.infinito", tenseKey: "infinito", tense: "Infinito", it: "parlare", en: "to speak" });
    expect(card("crescere", "crescere").en).toBe("to grow up");
    expect(card("capire", "capire").en).toBe("to understand");
  });

  it("imperativo cards cover tu, Lei, noi and voi", () => {
    const imp = cardsOf("parlare").filter((c) => c.tense === "Imperativo").map((c) => [c.it, c.en]);
    expect(imp).toEqual([
      ["(tu) parla!", "speak!"],
      ["(Lei) parli!", "speak! (polite)"],
      ["(noi) parliamo!", "let's speak!"],
      ["(voi) parlate!", "speak! (you all)"],
    ]);
  });

  it.each([
    ["parlare", "lui/lei parla", "he/she speaks"],
    ["guardare", "lui/lei guarda", "he/she watches"],
    ["finire", "lui/lei finisce", "he/she finishes"],
    ["passare", "lui/lei passa", "he/she passes"],
    ["vestire", "lui/lei veste", "he/she dresses"],
    ["studiare", "lui/lei studia", "he/she studies"],
    ["provare", "lui/lei prova", "he/she tries"],
    ["giocare", "lui/lei gioca", "he/she plays"],
    ["crescere", "lui/lei cresce", "he/she grows up"],
    ["riflettere", "lui/lei riflette", "he/she thinks it over"],
  ])("English third person: %s → %s", (infinitive, it, en) => {
    expect(card(infinitive, it).en).toBe(en);
  });
});

describe("every form of every verb (snapshot)", () => {
  // A readable list of all forms and cards. If a change alters any form, the diff
  // shows exactly which ones; check them, then run `npx vitest run -u` to accept.
  it("matches tests/__snapshots__/conjugations.txt", async () => {
    const lines = [];
    for (const v of verbs) {
      lines.push(`## ${v.infinitive} (${v.group}, ${v.auxiliary}) — participio ${participle(v)}, gerundio ${gerund(v)}`);
      for (const [tense, name] of TENSES) {
        lines.push(`${name}: ${[0, 1, 2, 3, 4, 5].map((p) => form(v, tense, p) ?? "—").join(", ")}`);
      }
      for (const c of cardsFor(v)) lines.push(`card [${c.tense}] ${c.it} = ${c.en}`);
      lines.push("");
    }
    await expect(lines.join("\n")).toMatchFileSnapshot("__snapshots__/conjugations.txt");
  });
});
