"""Generate a Markdown conjugation reference for common regular -ere verbs."""
import sys

SC_NOTE = ("Spelled regularly, but the sound changes: *-sc-* is hard [sk] before *o*/*a* "
           "(*{a}*) and soft [ʃ] before *i*/*e* (*{b}*). The participle adds an **i** to keep "
           "the soft sound: *{c}*.")

# (infinitive, English, auxiliary, note) in approximate frequency order
VERBS = [
    ("credere", "to believe, to think", "avere", ""),
    ("conoscere", "to know (people, places), to meet", "avere",
     SC_NOTE.format(a="conosco, conoscono", b="conosci, conosce", c="conosciuto")),
    ("ricevere", "to receive", "avere", ""),
    ("vendere", "to sell", "avere", ""),
    ("ripetere", "to repeat", "avere", ""),
    ("crescere", "to grow (up), to raise", "avere/essere",
     "**essere** when the subject grows (*sono cresciuto a Roma*); **avere** when you raise someone "
     "(*ho cresciuto due figli*). " + SC_NOTE.format(a="cresco, crescono", b="cresci, cresce", c="cresciuto")),
    ("insistere", "to insist", "avere",
     "The one small exception in this file: the participle ends in **-ito**, not *-uto*: *ho insistito*. "
     "The same goes for *esistere* (*è esistito*) and *resistere* (*ho resistito*). "
     "Everything else is regular: *Se insisti…* · *Non insistere!*"),
    ("riflettere", "to think (it over), to reflect", "avere",
     "*Ci devo riflettere* = I need to think about it. "
     "When it means reflecting light or images, the participle is *riflesso*: *lo specchio ha riflesso la luce*."),
    ("battere", "to beat, to hit, to type", "avere", ""),
    ("riconoscere", "to recognize, to admit", "avere",
     SC_NOTE.format(a="riconosco, riconoscono", b="riconosci, riconosce", c="riconosciuto")),
    ("piovere", "to rain", "avere/essere",
     "In practice used only in the *lui/lei* form: *piove*, *è piovuto* / *ha piovuto*, *pioveva*, "
     "*pioverà*, *pioverebbe*. Both auxiliaries are correct for the weather; *è piovuto* is the more common. "
     "Figuratively it can take other persons: *Gli piovono addosso critiche*."),
    ("combattere", "to fight", "avere", ""),
    ("procedere", "to proceed, to go on, to progress", "avere/essere",
     "**avere** when people go ahead with something (*abbiamo proceduto con il piano*); "
     "**essere** when things progress (*i lavori sono proceduti bene*). "
     "Everyday use: *Come procede?* = How's it going?"),
    ("precedere", "to precede, to come before", "avere", ""),
    ("spremere", "to squeeze", "avere", ""),
]

PARTICIPLE_OVERRIDE = {"insistere": "insistit"}

PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"]

TENSES = [
    ("Presente", ["o", "i", "e", "iamo", "ete", "ono"]),
    ("Passato prossimo", None),
    ("Imperfetto", ["evo", "evi", "eva", "evamo", "evate", "evano"]),
    ("Futuro", ["erò", "erai", "erà", "eremo", "erete", "eranno"]),
    ("Condizionale", ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"]),
    ("Imperativo", [None, "i", "a", "iamo", "ete", "ano"]),
]

AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"]
ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"]


def stem(inf):
    return inf[:-3]


def participle_base(inf):
    if inf in PARTICIPLE_OVERRIDE:
        return PARTICIPLE_OVERRIDE[inf]
    s = stem(inf)
    # keep the soft c/sc sound: conosciuto, cresciuto
    return s + ("iut" if s.endswith("c") else "ut")


def passato_prossimo(inf, aux):
    part = participle_base(inf)
    if aux == "avere":
        return [f"{a} {part}o" for a in AVERE]
    sing = f"{part}o/a"
    plur = f"{part}i/e"
    forms = [f"{a} {sing if i < 3 else plur}" for i, a in enumerate(ESSERE)]
    if aux == "avere/essere":
        return [f"{h} {part}o · {e}" for h, e in zip(AVERE, forms)]
    return forms


def verb_section(n, inf, eng, aux, note):
    out = [f"### {n}. {inf} — *{eng}*", ""]
    info = [f"**Participio:** {participle_base(inf)}o", f"**Gerundio:** {stem(inf)}endo", f"**Ausiliare:** {aux}"]
    out.append(" · ".join(info))
    out.append("")
    if note:
        out.append(f"> ℹ️ {note}")
        out.append("")
    out += ["| | " + " | ".join(t for t, _ in TENSES) + " |", "|---|" + "---|" * len(TENSES)]
    pp = passato_prossimo(inf, aux)
    for i, p in enumerate(PRONOUNS):
        cells = []
        for name, endings in TENSES:
            if endings is None:
                cells.append(pp[i])
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append(stem(inf) + endings[i])
        out.append(f"| **{p}** | " + " | ".join(cells) + " |")
    out.append("")
    return out


def main(path):
    L = [
        f"# {len(VERBS)} Common Regular -ere Verbs",
        "",
        "A conjugation reference for common Italian verbs ending in *-ere* that are **regular in every tense** shown here (only *insistere* has a small twist in the participle).",
        "Most frequent -ere verbs have an irregular participle (*prendere → preso*, *leggere → letto*)",
        "or are fully irregular (*essere, avere, potere, volere, dovere, sapere*), so they are left out.",
        "",
        "## The tenses",
        "",
        "- **Presente** — the present. What happens now, habits, and often the near future.",
        "  *Credo di sì.* · *Il sabato vendiamo frutta al mercato.* · *Domani ripeto la lezione.*",
        "- **Passato prossimo** — the everyday past for completed actions. Formed with *avere* or *essere* + participle.",
        "  With *essere* the participle agrees with the subject: *sono cresciuto/cresciuta*, *siamo cresciuti/cresciute*.",
        "  Some verbs take both, shown as *ho cresciuto · sono cresciuto/a*.",
        "  *Ieri ho ricevuto un pacco.* · *Sono cresciuta a Milano.*",
        "- **Imperfetto** — the past for background, descriptions, habits and ongoing actions (\"used to\", \"was …ing\").",
        "  *Da bambino credevo a Babbo Natale.* · *Mentre ripetevo i verbi, è arrivato Marco.*",
        "- **Futuro** — the future, and also guesses about the present.",
        "  *L'anno prossimo venderemo la macchina.* · *Riceverai la lettera domani.*",
        "- **Condizionale** — \"would\": polite requests, wishes and hypothetical situations.",
        "  *Venderei la casa, ma non posso.* · *Ripeteresti, per favore?*",
        "- **Imperativo** — commands, requests and invitations. There is no *io* form.",
        "  The *lui/lei* row is the polite **Lei** form, and the *loro* row is the formal plural **Loro**.",
        "  The negative *tu* form uses the infinitive: *non credere!*",
        "  *Credimi!* · *Scusi, ripeta per favore.* · *Non vendere la macchina!*",
        "",
        "## The pattern (credere)",
        "",
        f"All {len(VERBS)} verbs follow these endings, added to the stem (*cred-*):",
        "",
        "| | " + " | ".join(t for t, _ in TENSES) + " |",
        "|---|" + "---|" * len(TENSES),
    ]
    for i, p in enumerate(PRONOUNS):
        cells = []
        for name, endings in TENSES:
            if endings is None:
                cells.append(f"{AVERE[i]} -uto")
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append("-" + endings[i])
        L.append(f"| **{p}** | " + " | ".join(cells) + " |")
    L += [
        "",
        "Compared with -are verbs, the differences are in the presente (*-e, -ete, -ono*), the imperfetto (*-evo*),",
        "the imperativo (*tu* **-i**, *Lei* **-a** — the opposite of -are) and the participle (**-uto**).",
        "",
        "## Index",
        "",
        "| # | Verb | English | Passato prossimo (io) |",
        "|---|---|---|---|",
    ]
    for j, (inf, eng, aux, _) in enumerate(VERBS, 1):
        L.append(f"| {j} | **{inf}** | {eng} | {passato_prossimo(inf, aux)[0]} |")
    L += ["", "## Conjugations", ""]
    for n, (inf, eng, aux, note) in enumerate(VERBS, 1):
        L += verb_section(n, inf, eng, aux, note)
    with open(path, "w") as f:
        f.write("\n".join(L).rstrip("\n") + "\n")


if __name__ == "__main__":
    assert len(VERBS) == 15, len(VERBS)
    main(sys.argv[1])
