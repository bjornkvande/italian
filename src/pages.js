// The text on the -are / -ere / -ire pages. Inline Markdown (*italic*, **bold**) is allowed.
// The verbs, tables and index are generated from dictionary/verbs.csv.

export const PAGES = {
  are: {
    documentTitle: "Verbi -are",
    title: (n) => `The ${n} Most Common Regular -are Verbs`,
    intro: [
      "A conjugation reference for the most frequently used **regular** Italian verbs ending in *-are*.",
      "The irregular -are verbs (**andare, dare, fare, stare**) are deliberately left out.",
    ],
    examples: {
      presente: "*Parlo italiano.* · *Ogni giorno lavoro fino alle sei.* · *Domani ti chiamo.*",
      agreement: "*sono arrivato/arrivata*, *siamo arrivati/arrivate*",
      both: "*ho cominciato · sono cominciato/a*",
      passato: "*Ieri ho mangiato al ristorante.* · *Sono tornata a casa tardi.*",
      imperfetto: "*Da bambino giocavo a calcio.* · *Mentre guardavo la TV, è arrivato Marco.*",
      futuro: "*L'anno prossimo studierò di più.* · *Che ore sono? Saranno le otto.*",
      condizionale: "*Mangerei volentieri una pizza.* · *Mi aiuteresti?*",
      negative: "*non parlare!*",
      imperativo: "*Aspetta un attimo!* · *Scusi, parli più piano.* · *Andiamo!*",
    },
    patternsHeading: "The pattern (parlare)",
    patterns: [{ group: "are", text: (n) => `All ${n} verbs follow these endings, added to the stem (*parl-*):` }],
    afterPatterns: [],
    sections: [{ groups: ["are"] }],
  },

  ere: {
    documentTitle: "Verbi -ere",
    title: (n) => `${n} Common Regular -ere Verbs`,
    intro: [
      "A conjugation reference for common Italian verbs ending in *-ere* that are **regular in every tense** shown here (only *insistere* has a small twist in the participle).",
      "Most frequent -ere verbs have an irregular participle (*prendere → preso*, *leggere → letto*) or are fully irregular (*essere, avere, potere, volere, dovere, sapere*), so they are left out.",
    ],
    examples: {
      presente: "*Credo di sì.* · *Il sabato vendiamo frutta al mercato.* · *Domani ripeto la lezione.*",
      agreement: "*sono cresciuto/cresciuta*, *siamo cresciuti/cresciute*",
      both: "*ho cresciuto · sono cresciuto/a*",
      passato: "*Ieri ho ricevuto un pacco.* · *Sono cresciuta a Milano.*",
      imperfetto: "*Da bambino credevo a Babbo Natale.* · *Mentre ripetevo i verbi, è arrivato Marco.*",
      futuro: "*L'anno prossimo venderemo la macchina.* · *Riceverai la lettera domani.*",
      condizionale: "*Venderei la casa, ma non posso.* · *Ripeteresti, per favore?*",
      negative: "*non credere!*",
      imperativo: "*Credimi!* · *Scusi, ripeta per favore.* · *Non vendere la macchina!*",
    },
    patternsHeading: "The pattern (credere)",
    patterns: [{ group: "ere", text: (n) => `All ${n} verbs follow these endings, added to the stem (*cred-*):` }],
    afterPatterns: [
      "Compared with -are verbs, the differences are in the presente (*-e, -ete, -ono*), the imperfetto (*-evo*), the imperativo (*tu* **-i**, *Lei* **-a** — the opposite of -are) and the participle (**-uto**).",
    ],
    sections: [{ groups: ["ere"] }],
  },

  ire: {
    documentTitle: "Verbi -ire",
    title: (n) => `${n} Common Regular -ire Verbs`,
    intro: [
      "A conjugation reference for common Italian verbs ending in *-ire* that are **regular in every tense** shown here. Fully irregular verbs (*venire, dire, uscire, salire, morire*) and verbs with an irregular participle (*aprire → aperto, offrire → offerto, soffrire → sofferto, coprire → coperto*) are left out.",
      "Regular -ire verbs come in **two types**: the *dormire* type and the *finire* type, which adds **-isc-** in some forms. There's no rule that tells you which type a verb belongs to, so learn it with the verb. The *finire* type is the larger group.",
    ],
    examples: {
      presente: "*Non capisco.* · *Il treno parte alle otto.* · *Domani finisco presto.*",
      agreement: "*sono partito/partita*, *siamo partiti/partite*",
      both: "*ho finito · sono finito/a*",
      passato: "*Ho dormito benissimo.* · *Siamo partiti alle sei.*",
      imperfetto: "*Da piccola dormivo con la luce accesa.* · *Mentre pulivo la cucina, è arrivato Marco.*",
      futuro: "*Finirò il lavoro domani.* · *Partirete in treno?*",
      condizionale: "*Preferirei un caffè.* · *Mi servirebbe una mano.*",
      negative: "*non partire!*",
      imperativo: "*Senti!* · *Scusi, mi segua.* · *Finisci i compiti!*",
    },
    patternsHeading: "The patterns",
    patterns: [
      { heading: "dormire type", group: "ire-dormire", text: () => "Endings added to the stem (*dorm-*):" },
      { heading: "finire type (-isc-)", group: "ire-finire", text: () => "Endings added to the stem (*fin-*):" },
    ],
    afterPatterns: [
      "The **-isc-** only appears in the presente and imperativo, and only in the *io, tu, lui/lei* and *loro* forms. *Noi* and *voi* are the same as the *dormire* type (*finiamo, finite*), and all other tenses are identical.",
      "Compared with -are verbs, the imperativo works like -ere: *tu* **-i**, *Lei* **-a** (*dormi!* / *dorma!*, *finisci!* / *finisca!*). The participle ends in **-ito**.",
    ],
    sections: [
      { heading: "dormire type", groups: ["ire-dormire"] },
      { heading: "finire type (-isc-)", groups: ["ire-finire"] },
    ],
  },

  irregular: {
    documentTitle: "Verbi irregolari",
    title: (n) => `${n} Common Irregular Verbs`,
    intro: [
      "The most common Italian verbs are irregular: their forms don't follow the *-are*, *-ere* or *-ire* patterns, so each one has to be learnt on its own.",
      "The passato prossimo is still built the usual way, with *avere* or *essere* + the participle, but the participle itself is often irregular (*fatto*, *detto*, *stato*).",
    ],
    examples: {
      presente: "*Sono stanco.* · *Vado al lavoro in bici.* · *Domani faccio la spesa.*",
      agreement: "*sono andato/andata*, *siamo venuti/venute*",
      passato: "*Ieri ho fatto una passeggiata.* · *Siamo stati a Roma.*",
      imperfetto: "*Da bambino andavo al mare ogni estate.* · *Mentre facevo la doccia, è arrivato Marco.*",
      futuro: "*Domani sarò a casa.* · *Che ore sono? Saranno le otto.*",
      condizionale: "*Vorrei un caffè, per favore.* · *Dovresti venire anche tu.*",
      negative: "*non andare!*",
      imperativo: "*Vieni qui!* · *Mi dica.* · *Andiamo!*",
    },
    patternsHeading: "",
    patterns: [],
    afterPatterns: [],
    sections: [{ groups: ["irregular"] }],
  },
};
