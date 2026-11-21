// The text on the German verb pages (de/regular.html, ...). Inline Markdown
// (*italic*, **bold**) is allowed. Tables and index come from dictionary/de/verbs-*.csv.

export const PAGES = {
  regular: {
    title: (n) => `${n} Common Regular Verbs`,
    intro: [
      "**Regular** (weak) verbs keep their stem in every form: you only add endings. The Präteritum adds *-te*, and the participle is *ge-* + stem + *-t*: *machen → machte → gemacht*.",
      "An *e* is added before *-st* and *-t* when the stem ends in *-t* or *-d*, or in a consonant + *m/n*: *du arbeitest, er öffnet*. A stem in *-s, -ß, -z* takes only *-t* for *du*: *du tanzt*.",
      "No *ge-* when the verb starts with *be-, ver-, er-, ent-, ge-, zer-* or ends in *-ieren*: *bezahlt, erklärt, studiert*.",
    ],
    pattern: "machen",
    groups: ["regular"],
  },
  irregular: {
    title: (n) => `${n} Common Irregular Verbs`,
    intro: [
      "**Irregular** (strong) verbs change their vowel in the Präteritum and often in the participle, which ends in *-en*: *sprechen → sprach → gesprochen*. Learn these three forms with the verb.",
      "Many also change the vowel for *du* and *er/sie/es* in the Präsens: *e → i/ie* (*du sprichst, er sieht*), *a → ä* (*du fährst*), *au → äu* (*du läufst*). The *e → i* verbs keep that vowel in the *du* imperative: *sprich!, nimm!*.",
      "A few **mixed** verbs change the vowel but take the regular endings: *bringen → brachte → gebracht*, *denken → dachte → gedacht*, *kennen → kannte → gekannt*.",
    ],
    groups: ["irregular"],
  },
  separable: {
    title: (n) => `${n} Common Separable Verbs`,
    intro: [
      "Many verbs have a **separable prefix** (*an, auf, aus, ein, mit, zu, zurück…*), stressed in speech: *anrufen*. In a main clause the prefix goes to the end: *Ich rufe dich morgen an.*",
      "In the participle *ge* goes between the prefix and the verb: *angerufen, eingekauft*. With *würde* and the modal verbs the verb stays together (*Ich muss dich anrufen*); *zu* goes between the prefix and the verb: *Vergiss nicht, mich anzurufen.*",
      "Otherwise they conjugate like the verb without the prefix: *anrufen* like *rufen*, *aufstehen* like *stehen*.",
    ],
    groups: ["separable"],
  },
  modal: {
    title: () => "Auxiliary and Modal Verbs",
    intro: [
      "*sein*, *haben* and *werden* build the other tenses: the Perfekt (*habe gemacht, bin gegangen*), the future (*werde machen*) and the Konjunktiv II (*würde machen*).",
      "The **modal verbs** say whether you can, must, want, should, may or like to do something. The other verb goes to the end as an infinitive: *Ich kann heute nicht kommen.* Their past is usually the Präteritum (*konnte, musste*), so their Perfekt isn't shown.",
      "*wissen* (to know facts) is conjugated like a modal verb: *ich weiß, du weißt, er weiß*.",
    ],
    groups: ["modal"],
  },
};
