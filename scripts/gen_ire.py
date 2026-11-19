"""Generate a Markdown conjugation reference for 25 common regular -ire verbs."""
import sys

# (infinitive, English, auxiliary, note) in approximate frequency order within each group
DORMIRE_TYPE = [
    ("dormire", "to sleep", "avere", ""),
    ("partire", "to leave, to depart", "essere", ""),
    ("sentire", "to hear, to feel, to smell", "avere",
     "*Senti…* (informal) / *Senta…* (formal) is the everyday way to get someone's attention: \"Listen…\" / \"Excuse me…\"."),
    ("servire", "to serve, to be useful, to be needed", "avere/essere",
     "**avere** when you serve something (*ho servito il caffè*); **essere** when something is useful or needed "
     "(*mi è servito molto*). Everyday use: *Ti serve qualcosa?* = Do you need anything?"),
    ("seguire", "to follow, to take (a course)", "avere", ""),
    ("vestire", "to dress (someone)", "avere",
     "Most often reflexive, **vestirsi** (to get dressed), which takes **essere**: "
     "*mi vesto*, *mi sono vestito/a*."),
    ("divertire", "to amuse, to entertain", "avere",
     "Most often reflexive, **divertirsi** (to have fun), which takes **essere**: "
     "*mi diverto*, *ci siamo divertiti/e*. Without *si*: *il film mi ha divertito*."),
    ("avvertire", "to warn, to let know, to notice", "avere", ""),
]

FINIRE_TYPE = [
    ("capire", "to understand", "avere", ""),
    ("finire", "to finish, to end", "avere/essere",
     "**avere** when someone finishes something (*ho finito il lavoro*); "
     "**essere** when the subject itself ends (*il film è finito*)."),
    ("preferire", "to prefer", "avere", ""),
    ("pulire", "to clean", "avere", ""),
    ("costruire", "to build", "avere", ""),
    ("suggerire", "to suggest", "avere", ""),
    ("sparire", "to disappear", "essere", ""),
    ("spedire", "to send (by post), to ship", "avere", ""),
    ("guarire", "to heal, to recover, to get well", "avere/essere",
     "**essere** when the subject gets better (*sono guarito/a*); "
     "**avere** when someone heals someone else (*il medico ha guarito il paziente*)."),
    ("restituire", "to give back, to return", "avere", ""),
    ("impedire", "to prevent", "avere", ""),
    ("colpire", "to hit, to strike, to impress", "avere", ""),
    ("gestire", "to manage, to run", "avere", ""),
    ("garantire", "to guarantee", "avere", ""),
    ("fornire", "to supply, to provide", "avere", ""),
    ("reagire", "to react", "avere", ""),
    ("trasferire", "to transfer, to move", "avere",
     "Moving house or city is reflexive, **trasferirsi**, which takes **essere**: "
     "*mi sono trasferito/a a Bologna*."),
]

PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"]

SHARED = [
    ("Imperfetto", ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"]),
    ("Futuro", ["irò", "irai", "irà", "iremo", "irete", "iranno"]),
    ("Condizionale", ["irei", "iresti", "irebbe", "iremmo", "ireste", "irebbero"]),
]

TENSES = {
    "dormire": [
        ("Presente", ["o", "i", "e", "iamo", "ite", "ono"]),
        ("Passato prossimo", None),
        *SHARED,
        ("Imperativo", [None, "i", "a", "iamo", "ite", "ano"]),
    ],
    "finire": [
        ("Presente", ["isco", "isci", "isce", "iamo", "ite", "iscono"]),
        ("Passato prossimo", None),
        *SHARED,
        ("Imperativo", [None, "isci", "isca", "iamo", "ite", "iscano"]),
    ],
}

AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"]
ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"]


def stem(inf):
    return inf[:-3]


def passato_prossimo(inf, aux):
    part = stem(inf) + "it"
    if aux == "avere":
        return [f"{a} {part}o" for a in AVERE]
    sing = f"{part}o/a"
    plur = f"{part}i/e"
    forms = [f"{a} {sing if i < 3 else plur}" for i, a in enumerate(ESSERE)]
    if aux == "avere/essere":
        return [f"{h} {part}o · {e}" for h, e in zip(AVERE, forms)]
    return forms


def header(tenses):
    return ["| | " + " | ".join(t for t, _ in tenses) + " |", "|---|" + "---|" * len(tenses)]


def verb_section(n, inf, eng, aux, note, kind):
    tenses = TENSES[kind]
    out = [f"### {n}. {inf} — *{eng}*", ""]
    info = [f"**Participio:** {stem(inf)}ito", f"**Gerundio:** {stem(inf)}endo", f"**Ausiliare:** {aux}"]
    out += [" · ".join(info), ""]
    if note:
        out += [f"> ℹ️ {note}", ""]
    out += header(tenses)
    pp = passato_prossimo(inf, aux)
    for i, p in enumerate(PRONOUNS):
        cells = []
        for name, endings in tenses:
            if endings is None:
                cells.append(pp[i])
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append(stem(inf) + endings[i])
        out.append(f"| **{p}** | " + " | ".join(cells) + " |")
    out.append("")
    return out


def pattern_table(kind):
    out = header(TENSES[kind])
    for i, p in enumerate(PRONOUNS):
        cells = []
        for name, endings in TENSES[kind]:
            if endings is None:
                cells.append(f"{AVERE[i]} -ito")
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append("-" + endings[i])
        out.append(f"| **{p}** | " + " | ".join(cells) + " |")
    return out


def index_table(verbs, start):
    out = ["| # | Verb | English | Passato prossimo (io) |", "|---|---|---|---|"]
    for j, (inf, eng, aux, _) in enumerate(verbs, start):
        out.append(f"| {j} | **{inf}** | {eng} | {passato_prossimo(inf, aux)[0]} |")
    return out


def main(path):
    total = len(DORMIRE_TYPE) + len(FINIRE_TYPE)
    L = [
        f"# {total} Common Regular -ire Verbs",
        "",
        "A conjugation reference for common Italian verbs ending in *-ire* that are **regular in every tense** shown here.",
        "Fully irregular verbs (*venire, dire, uscire, salire, morire*) and verbs with an irregular participle",
        "(*aprire → aperto, offrire → offerto, soffrire → sofferto, coprire → coperto*) are left out.",
        "",
        "Regular -ire verbs come in **two types**: the *dormire* type and the *finire* type, which adds **-isc-**",
        "in some forms. There's no rule that tells you which type a verb belongs to, so learn it with the verb.",
        "The *finire* type is the larger group.",
        "",
        "## The tenses",
        "",
        "- **Presente** — the present. What happens now, habits, and often the near future.",
        "  *Non capisco.* · *Il treno parte alle otto.* · *Domani finisco presto.*",
        "- **Passato prossimo** — the everyday past for completed actions. Formed with *avere* or *essere* + participle.",
        "  With *essere* the participle agrees with the subject: *sono partito/partita*, *siamo partiti/partite*.",
        "  Some verbs take both, shown as *ho finito · sono finito/a*.",
        "  *Ho dormito benissimo.* · *Siamo partiti alle sei.*",
        "- **Imperfetto** — the past for background, descriptions, habits and ongoing actions (\"used to\", \"was …ing\").",
        "  *Da piccola dormivo con la luce accesa.* · *Mentre pulivo la cucina, è arrivato Marco.*",
        "- **Futuro** — the future, and also guesses about the present.",
        "  *Finirò il lavoro domani.* · *Partirete in treno?*",
        "- **Condizionale** — \"would\": polite requests, wishes and hypothetical situations.",
        "  *Preferirei un caffè.* · *Mi servirebbe una mano.*",
        "- **Imperativo** — commands, requests and invitations. There is no *io* form.",
        "  The *lui/lei* row is the polite **Lei** form, and the *loro* row is the formal plural **Loro**.",
        "  The negative *tu* form uses the infinitive: *non partire!*",
        "  *Senti!* · *Scusi, mi segua.* · *Finisci i compiti!*",
        "",
        "## The patterns",
        "",
        "### dormire type",
        "",
        "Endings added to the stem (*dorm-*):",
        "",
        *pattern_table("dormire"),
        "",
        "### finire type (-isc-)",
        "",
        "Endings added to the stem (*fin-*):",
        "",
        *pattern_table("finire"),
        "",
        "The **-isc-** only appears in the presente and imperativo, and only in the *io, tu, lui/lei* and *loro* forms.",
        "*Noi* and *voi* are the same as the *dormire* type (*finiamo, finite*), and all other tenses are identical.",
        "",
        "Compared with -are verbs, the imperativo works like -ere: *tu* **-i**, *Lei* **-a** (*dormi!* / *dorma!*,",
        "*finisci!* / *finisca!*). The participle ends in **-ito**.",
        "",
        "## Index",
        "",
        "### dormire type",
        "",
        *index_table(DORMIRE_TYPE, 1),
        "",
        "### finire type (-isc-)",
        "",
        *index_table(FINIRE_TYPE, len(DORMIRE_TYPE) + 1),
        "",
        "## Conjugations — dormire type",
        "",
    ]
    n = 1
    for inf, eng, aux, note in DORMIRE_TYPE:
        L += verb_section(n, inf, eng, aux, note, "dormire")
        n += 1
    L += ["## Conjugations — finire type (-isc-)", ""]
    for inf, eng, aux, note in FINIRE_TYPE:
        L += verb_section(n, inf, eng, aux, note, "finire")
        n += 1
    with open(path, "w") as f:
        f.write("\n".join(L).rstrip("\n") + "\n")


if __name__ == "__main__":
    assert len(DORMIRE_TYPE) + len(FINIRE_TYPE) == 25
    main(sys.argv[1])
