// The text on the French verb pages (fr/er.html, ...). Inline Markdown
// (*italic*, **bold**) is allowed. Tables and index come from dictionary/fr/verbs-*.csv.

export const PAGES = {
  er: {
    title: (n) => `${n} Common Regular -er Verbs`,
    intro: [
      "Most French verbs end in *-er*, and almost all of them are **regular**: the endings are added to the stem (*parl-*). *aller* is the only irregular *-er* verb.",
      "A few change their spelling to keep the sound: *nous commençons, nous mangeons* (before *a* and *o*), and *j'achète, j'appelle, je préfère, je paie* before a silent ending.",
    ],
    pattern: { group: "er", verb: "parler", stem: "parl-" },
    groups: ["er"],
  },
  ir: {
    title: (n) => `${n} Common Regular -ir Verbs`,
    intro: [
      "Regular *-ir* verbs add **-iss-** in the plural of the présent and in the imparfait: *nous finissons, je finissais*.",
      "Many common *-ir* verbs don't: *partir, sortir, dormir, ouvrir, venir*. They are on the Irregular page.",
    ],
    pattern: { group: "ir", verb: "finir", stem: "fin-" },
    groups: ["ir"],
  },
  re: {
    title: (n) => `${n} Common Regular -re Verbs`,
    intro: [
      "Regular *-re* verbs keep their stem (*vend-*); the *il* form has no ending: *il vend*. The participle ends in *-u*: *vendu*.",
      "*prendre, mettre, dire, faire, boire, écrire, lire* are irregular: see the Irregular page.",
    ],
    pattern: { group: "re", verb: "vendre", stem: "vend-" },
    groups: ["re"],
  },
  irregular: {
    title: (n) => `${n} Common Irregular Verbs`,
    intro: [
      "The most used verbs are irregular, above all in the présent: *être, avoir, aller, faire, pouvoir, vouloir, devoir, savoir*. Learn their présent, future stem (*ser-, aur-, ir-, fer-*) and participle.",
      "The rest follows from those: the imparfait comes from the *nous* form (*nous buvons → je buvais*; only *être* has *ét-*), and the conditionnel uses the future stem with the imparfait endings (*je serais*).",
    ],
    groups: ["irregular"],
  },
};
