"""Generate the verb conjugation Markdown files from dictionary/verbs.csv.

Usage (from the project folder):
    python3 scripts/generate.py

The CSV is the single source of verbs. Each row has:
    infinitive  the verb (parlare)
    english     the meaning
    group       are | ere | ire-dormire | ire-finire
    auxiliary   avere | essere | avere/essere
    participle  only if it differs from the regular form (insistito), otherwise empty
    en_base     English base form for the flash cards (speak, grow up)
    en_past     English simple past for the flash cards (spoke, grew up)
    impersonal  "yes" for weather verbs used only as "it" (piovere), otherwise empty
    note        optional note shown above the verb's table (Markdown allowed)

The en_base, en_past and impersonal columns are only used by the flash card app.

Verbs appear in the files in the same order as in the CSV.
"""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "dictionary" / "verbs.csv"

PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"]
AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"]
ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"]

# Endings per group. None in a tense list marks the passato prossimo column;
# None inside an ending list marks a form that does not exist (imperativo io).
TENSES = {
    "are": [
        ("Presente", ["o", "i", "a", "iamo", "ate", "ano"]),
        ("Passato prossimo", None),
        ("Imperfetto", ["avo", "avi", "ava", "avamo", "avate", "avano"]),
        ("Futuro", ["erò", "erai", "erà", "eremo", "erete", "eranno"]),
        ("Condizionale", ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"]),
        ("Imperativo", [None, "a", "i", "iamo", "ate", "ino"]),
    ],
    "ere": [
        ("Presente", ["o", "i", "e", "iamo", "ete", "ono"]),
        ("Passato prossimo", None),
        ("Imperfetto", ["evo", "evi", "eva", "evamo", "evate", "evano"]),
        ("Futuro", ["erò", "erai", "erà", "eremo", "erete", "eranno"]),
        ("Condizionale", ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"]),
        ("Imperativo", [None, "i", "a", "iamo", "ete", "ano"]),
    ],
    "ire-dormire": [
        ("Presente", ["o", "i", "e", "iamo", "ite", "ono"]),
        ("Passato prossimo", None),
        ("Imperfetto", ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"]),
        ("Futuro", ["irò", "irai", "irà", "iremo", "irete", "iranno"]),
        ("Condizionale", ["irei", "iresti", "irebbe", "iremmo", "ireste", "irebbero"]),
        ("Imperativo", [None, "i", "a", "iamo", "ite", "ano"]),
    ],
    "ire-finire": [
        ("Presente", ["isco", "isci", "isce", "iamo", "ite", "iscono"]),
        ("Passato prossimo", None),
        ("Imperfetto", ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"]),
        ("Futuro", ["irò", "irai", "irà", "iremo", "irete", "iranno"]),
        ("Condizionale", ["irei", "iresti", "irebbe", "iremmo", "ireste", "irebbero"]),
        ("Imperativo", [None, "isci", "isca", "iamo", "ite", "iscano"]),
    ],
}

PARTICIPLE_ENDING = {"are": "ato", "ere": "uto", "ire-dormire": "ito", "ire-finire": "ito"}
GERUND_ENDING = {"are": "ando", "ere": "endo", "ire-dormire": "endo", "ire-finire": "endo"}


# ---------------------------------------------------------------- conjugation

def load_verbs():
    with open(SOURCE, newline="", encoding="utf-8") as f:
        verbs = list(csv.DictReader(f))
    for v in verbs:
        if v["group"] not in TENSES:
            raise ValueError(f"{v['infinitive']}: unknown group {v['group']!r}")
    return verbs


def stem(inf):
    return inf[:-3]


def join(verb, ending):
    """Stem + ending, with the -are spelling adjustments (cerchi, mangerò, studi)."""
    inf, s = verb["infinitive"], stem(verb["infinitive"])
    if verb["group"] != "are":
        return s + ending
    if inf.endswith(("care", "gare")) and ending[0] in "ei":
        return s + "h" + ending
    if s.endswith("i"):
        if ending[0] == "i":  # -iare: never a double i
            return s[:-1] + ending
        if ending[0] == "e" and s[-2] in "cg":  # -ciare/-giare: drop the softening i
            return s[:-1] + ending
    return s + ending


def participle(verb):
    if verb["participle"]:
        return verb["participle"]
    s = stem(verb["infinitive"])
    if verb["group"] == "ere" and s.endswith("c"):  # keep the soft sound: conosciuto
        return s + "iuto"
    return s + PARTICIPLE_ENDING[verb["group"]]


def gerund(verb):
    return stem(verb["infinitive"]) + GERUND_ENDING[verb["group"]]


def passato_prossimo(verb):
    base = participle(verb)[:-1]
    aux = verb["auxiliary"]
    if aux == "avere":
        return [f"{a} {base}o" for a in AVERE]
    forms = [f"{a} {base}o/a" if i < 3 else f"{a} {base}i/e" for i, a in enumerate(ESSERE)]
    if aux == "avere/essere":
        return [f"{h} {base}o · {e}" for h, e in zip(AVERE, forms)]
    return forms


def spelling_group(verb):
    inf = verb["infinitive"]
    if verb["group"] != "are":
        return ""
    if inf.endswith(("care", "gare")):
        return "-care/-gare: adds **h** before *e*/*i* to keep the hard sound"
    if inf.endswith(("ciare", "giare")):
        return "-ciare/-giare: drops the **i** before *e*/*i*"
    if inf.endswith("iare"):
        return f"-iare: no double **i** (*tu {join(verb, 'i')}*, not *{stem(inf)}i*)"
    return ""


# ---------------------------------------------------------------- markdown parts

def table_header(group):
    tenses = TENSES[group]
    return ["| | " + " | ".join(t for t, _ in tenses) + " |", "|---|" + "---|" * len(tenses)]


def pattern_table(group):
    out = table_header(group)
    for i, p in enumerate(PRONOUNS):
        cells = []
        for _, endings in TENSES[group]:
            if endings is None:
                cells.append(f"{AVERE[i]} -{PARTICIPLE_ENDING[group]}")
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append("-" + endings[i])
        out.append(f"| **{p}** | " + " | ".join(cells) + " |")
    return out


def index_table(verbs, start=1):
    out = ["| # | Verb | English | Passato prossimo (io) |", "|---|---|---|---|"]
    for n, v in enumerate(verbs, start):
        out.append(f"| {n} | **{v['infinitive']}** | {v['english']} | {passato_prossimo(v)[0]} |")
    return out


def verb_section(n, verb):
    group = verb["group"]
    out = [f"### {n}. {verb['infinitive']} — *{verb['english']}*", ""]
    out += [f"**Participio:** {participle(verb)} · **Gerundio:** {gerund(verb)} · **Ausiliare:** {verb['auxiliary']}", ""]
    sg = spelling_group(verb)
    if sg:
        out += [f"> **Spelling change** — {sg}.", ""]
    if verb["note"]:
        out += [f"> ℹ️ {verb['note']}", ""]
    out += table_header(group)
    pp = passato_prossimo(verb)
    for i, p in enumerate(PRONOUNS):
        cells = []
        for _, endings in TENSES[group]:
            if endings is None:
                cells.append(pp[i])
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append(join(verb, endings[i]))
        out.append(f"| **{p}** | " + " | ".join(cells) + " |")
    out.append("")
    return out


def tenses_section(examples):
    """The shared 'The tenses' list; `examples` fills in the per-file example sentences."""
    e = examples
    return [
        "## The tenses",
        "",
        "- **Presente** — the present. What happens now, habits, and often the near future.",
        f"  {e['presente']}",
        "- **Passato prossimo** — the everyday past for completed actions. Formed with *avere* or *essere* + participle.",
        f"  With *essere* the participle agrees with the subject: {e['agreement']}.",
        f"  Some verbs take both, shown as {e['both']}.",
        f"  {e['passato']}",
        "- **Imperfetto** — the past for background, descriptions, habits and ongoing actions (\"used to\", \"was …ing\").",
        f"  {e['imperfetto']}",
        "- **Futuro** — the future, and also guesses about the present.",
        f"  {e['futuro']}",
        "- **Condizionale** — \"would\": polite requests, wishes and hypothetical situations.",
        f"  {e['condizionale']}",
        "- **Imperativo** — commands, requests and invitations. There is no *io* form.",
        "  The *lui/lei* row is the polite **Lei** form, and the *loro* row is the formal plural **Loro**.",
        f"  The negative *tu* form uses the infinitive: {e['negative']}",
        f"  {e['imperativo']}",
        "",
    ]


# ---------------------------------------------------------------- pages

def page_are(verbs):
    L = [
        f"# The {len(verbs)} Most Common Regular -are Verbs",
        "",
        "A conjugation reference for the most frequently used **regular** Italian verbs ending in *-are*.",
        "The irregular -are verbs (**andare, dare, fare, stare**) are deliberately left out.",
        "",
        *tenses_section({
            "presente": "*Parlo italiano.* · *Ogni giorno lavoro fino alle sei.* · *Domani ti chiamo.*",
            "agreement": "*sono arrivato/arrivata*, *siamo arrivati/arrivate*",
            "both": "*ho cominciato · sono cominciato/a*",
            "passato": "*Ieri ho mangiato al ristorante.* · *Sono tornata a casa tardi.*",
            "imperfetto": "*Da bambino giocavo a calcio.* · *Mentre guardavo la TV, è arrivato Marco.*",
            "futuro": "*L'anno prossimo studierò di più.* · *Che ore sono? Saranno le otto.*",
            "condizionale": "*Mangerei volentieri una pizza.* · *Mi aiuteresti?*",
            "negative": "*non parlare!*",
            "imperativo": "*Aspetta un attimo!* · *Scusi, parli più piano.* · *Andiamo!*",
        }),
        "## The pattern (parlare)",
        "",
        f"All {len(verbs)} verbs follow these endings, added to the stem (*parl-*):",
        "",
        *pattern_table("are"),
        "",
        "## Index",
        "",
        *index_table(verbs),
        "",
        "## Conjugations",
        "",
    ]
    for n, v in enumerate(verbs, 1):
        L += verb_section(n, v)
    return L


def page_ere(verbs):
    L = [
        f"# {len(verbs)} Common Regular -ere Verbs",
        "",
        "A conjugation reference for common Italian verbs ending in *-ere* that are **regular in every tense** shown here (only *insistere* has a small twist in the participle).",
        "Most frequent -ere verbs have an irregular participle (*prendere → preso*, *leggere → letto*)",
        "or are fully irregular (*essere, avere, potere, volere, dovere, sapere*), so they are left out.",
        "",
        *tenses_section({
            "presente": "*Credo di sì.* · *Il sabato vendiamo frutta al mercato.* · *Domani ripeto la lezione.*",
            "agreement": "*sono cresciuto/cresciuta*, *siamo cresciuti/cresciute*",
            "both": "*ho cresciuto · sono cresciuto/a*",
            "passato": "*Ieri ho ricevuto un pacco.* · *Sono cresciuta a Milano.*",
            "imperfetto": "*Da bambino credevo a Babbo Natale.* · *Mentre ripetevo i verbi, è arrivato Marco.*",
            "futuro": "*L'anno prossimo venderemo la macchina.* · *Riceverai la lettera domani.*",
            "condizionale": "*Venderei la casa, ma non posso.* · *Ripeteresti, per favore?*",
            "negative": "*non credere!*",
            "imperativo": "*Credimi!* · *Scusi, ripeta per favore.* · *Non vendere la macchina!*",
        }),
        "## The pattern (credere)",
        "",
        f"All {len(verbs)} verbs follow these endings, added to the stem (*cred-*):",
        "",
        *pattern_table("ere"),
        "",
        "Compared with -are verbs, the differences are in the presente (*-e, -ete, -ono*), the imperfetto (*-evo*),",
        "the imperativo (*tu* **-i**, *Lei* **-a** — the opposite of -are) and the participle (**-uto**).",
        "",
        "## Index",
        "",
        *index_table(verbs),
        "",
        "## Conjugations",
        "",
    ]
    for n, v in enumerate(verbs, 1):
        L += verb_section(n, v)
    return L


def page_ire(verbs):
    dormire = [v for v in verbs if v["group"] == "ire-dormire"]
    finire = [v for v in verbs if v["group"] == "ire-finire"]
    L = [
        f"# {len(verbs)} Common Regular -ire Verbs",
        "",
        "A conjugation reference for common Italian verbs ending in *-ire* that are **regular in every tense** shown here.",
        "Fully irregular verbs (*venire, dire, uscire, salire, morire*) and verbs with an irregular participle",
        "(*aprire → aperto, offrire → offerto, soffrire → sofferto, coprire → coperto*) are left out.",
        "",
        "Regular -ire verbs come in **two types**: the *dormire* type and the *finire* type, which adds **-isc-**",
        "in some forms. There's no rule that tells you which type a verb belongs to, so learn it with the verb.",
        "The *finire* type is the larger group.",
        "",
        *tenses_section({
            "presente": "*Non capisco.* · *Il treno parte alle otto.* · *Domani finisco presto.*",
            "agreement": "*sono partito/partita*, *siamo partiti/partite*",
            "both": "*ho finito · sono finito/a*",
            "passato": "*Ho dormito benissimo.* · *Siamo partiti alle sei.*",
            "imperfetto": "*Da piccola dormivo con la luce accesa.* · *Mentre pulivo la cucina, è arrivato Marco.*",
            "futuro": "*Finirò il lavoro domani.* · *Partirete in treno?*",
            "condizionale": "*Preferirei un caffè.* · *Mi servirebbe una mano.*",
            "negative": "*non partire!*",
            "imperativo": "*Senti!* · *Scusi, mi segua.* · *Finisci i compiti!*",
        }),
        "## The patterns",
        "",
        "### dormire type",
        "",
        "Endings added to the stem (*dorm-*):",
        "",
        *pattern_table("ire-dormire"),
        "",
        "### finire type (-isc-)",
        "",
        "Endings added to the stem (*fin-*):",
        "",
        *pattern_table("ire-finire"),
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
        *index_table(dormire),
        "",
        "### finire type (-isc-)",
        "",
        *index_table(finire, len(dormire) + 1),
        "",
        "## Conjugations — dormire type",
        "",
    ]
    n = 1
    for v in dormire:
        L += verb_section(n, v)
        n += 1
    L += ["## Conjugations — finire type (-isc-)", ""]
    for v in finire:
        L += verb_section(n, v)
        n += 1
    return L


PAGES = [
    ("verbi-regolari-are.md", ("are",), page_are),
    ("verbi-regolari-ere.md", ("ere",), page_ere),
    ("verbi-regolari-ire.md", ("ire-dormire", "ire-finire"), page_ire),
]


def main():
    verbs = load_verbs()
    for filename, groups, build in PAGES:
        selected = [v for v in verbs if v["group"] in groups]
        text = "\n".join(build(selected)).rstrip("\n") + "\n"
        (ROOT / filename).write_text(text, encoding="utf-8")
        print(f"{filename}: {len(selected)} verbs")


if __name__ == "__main__":
    main()
