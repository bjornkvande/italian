"""Generate a Markdown conjugation reference for the 50 most common regular -are verbs."""
import sys

# (infinitive, English, auxiliary, note) in approximate frequency order
VERBS = [
    ("parlare", "to speak, to talk", "avere", ""),
    ("pensare", "to think", "avere", ""),
    ("trovare", "to find", "avere", ""),
    ("lasciare", "to leave, to let", "avere", ""),
    ("portare", "to bring, to carry, to wear", "avere", ""),
    ("chiamare", "to call", "avere", ""),
    ("guardare", "to look at, to watch", "avere", ""),
    ("passare", "to pass, to spend (time), to stop by", "avere/essere",
     "**avere** with a direct object (*ho passato una bella giornata*); **essere** for movement (*sono passato da te*)."),
    ("arrivare", "to arrive", "essere", ""),
    ("tornare", "to return, to come back", "essere", ""),
    ("entrare", "to enter, to go in", "essere", ""),
    ("cercare", "to look for, to try to", "avere", ""),
    ("lavorare", "to work", "avere", ""),
    ("sembrare", "to seem", "essere", ""),
    ("restare", "to stay, to remain", "essere", ""),
    ("aspettare", "to wait (for)", "avere", ""),
    ("ricordare", "to remember, to remind", "avere", ""),
    ("continuare", "to continue", "avere/essere",
     "**avere** when someone continues something (*ho continuato a leggere*); **essere** when the subject itself continues (*la festa è continuata*)."),
    ("diventare", "to become", "essere", ""),
    ("cominciare", "to begin, to start", "avere/essere",
     "**avere** when someone starts something (*ho cominciato il libro*); **essere** when the subject itself starts (*il film è cominciato*)."),
    ("cambiare", "to change", "avere/essere",
     "**avere** when you change something (*ho cambiato casa*); **essere** when the subject changes (*la città è cambiata*)."),
    ("mangiare", "to eat", "avere", ""),
    ("pagare", "to pay", "avere", ""),
    ("giocare", "to play (games, sports)", "avere", ""),
    ("comprare", "to buy", "avere", ""),
    ("mandare", "to send", "avere", ""),
    ("amare", "to love", "avere", ""),
    ("provare", "to try, to feel", "avere", ""),
    ("usare", "to use", "avere", ""),
    ("mostrare", "to show", "avere", ""),
    ("incontrare", "to meet", "avere", ""),
    ("ascoltare", "to listen (to)", "avere", ""),
    ("aiutare", "to help", "avere", ""),
    ("presentare", "to present, to introduce", "avere", ""),
    ("considerare", "to consider", "avere", ""),
    ("spiegare", "to explain", "avere", ""),
    ("studiare", "to study", "avere", ""),
    ("toccare", "to touch; to be someone's turn", "avere",
     "In the sense *to be someone's turn* it takes **essere**: *è toccato a me*."),
    ("raccontare", "to tell (a story)", "avere", ""),
    ("iniziare", "to begin, to start", "avere/essere",
     "Same pattern as *cominciare*: *ho iniziato il corso* / *il corso è iniziato*."),
    ("preparare", "to prepare", "avere", ""),
    ("sperare", "to hope", "avere", ""),
    ("dimenticare", "to forget", "avere", ""),
    ("immaginare", "to imagine", "avere", ""),
    ("creare", "to create", "avere", ""),
    ("accettare", "to accept", "avere", ""),
    ("abitare", "to live (reside)", "avere", ""),
    ("domandare", "to ask", "avere", ""),
    ("viaggiare", "to travel", "avere", ""),
    ("insegnare", "to teach", "avere", ""),
]

PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"]

TENSES = [
    ("Presente", ["o", "i", "a", "iamo", "ate", "ano"]),
    ("Passato prossimo", None),
    ("Imperfetto", ["avo", "avi", "ava", "avamo", "avate", "avano"]),
    ("Futuro", ["erò", "erai", "erà", "eremo", "erete", "eranno"]),
    ("Condizionale", ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"]),
    ("Imperativo", [None, "a", "i", "iamo", "ate", "ino"]),
]

AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"]
ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"]


def join(inf, ending):
    stem = inf[:-3]
    if inf.endswith(("care", "gare")) and ending[0] in "ei":
        return stem + "h" + ending
    if stem.endswith("i"):
        # -iare: never write a double i (cambi, not cambii)
        if ending[0] == "i":
            return stem[:-1] + ending
        # -ciare / -giare: the i is only there to soften c/g, drop it before e
        if ending[0] == "e" and stem[-2] in "cg":
            return stem[:-1] + ending
    return stem + ending


def spelling_group(inf):
    if inf.endswith(("care", "gare")):
        return "-care/-gare: adds **h** before *e*/*i* to keep the hard sound"
    if inf.endswith(("ciare", "giare")):
        return "-ciare/-giare: drops the **i** before *e*/*i*"
    if inf.endswith("iare"):
        return "-iare: no double **i** (*tu " + join(inf, "i") + "*, not *" + inf[:-3] + "i*)"
    return ""


def passato_prossimo(inf, aux):
    part = inf[:-3] + "at"
    if aux == "avere":
        return [f"{a} {part}o" for a in AVERE]
    sing = f"{part}o/a"
    plur = f"{part}i/e"
    forms = [f"{a} {sing if i < 3 else plur}" for i, a in enumerate(ESSERE)]
    if aux == "avere/essere":
        return [f"{h} {part}o · {e}" for h, e in zip(AVERE, forms)]
    return forms


def anchor(inf):
    return inf


def verb_section(n, inf, eng, aux, note):
    out = [f"### {n}. {inf} — *{eng}*", ""]
    stem = inf[:-3]
    info = [f"**Participio:** {stem}ato", f"**Gerundio:** {stem}ando", f"**Ausiliare:** {aux}"]
    out.append(" · ".join(info))
    out.append("")
    sg = spelling_group(inf)
    if sg:
        out.append(f"> **Spelling change** — {sg}.")
        out.append("")
    if note:
        out.append(f"> ℹ️ {note}")
        out.append("")
    header = "| | " + " | ".join(t for t, _ in TENSES) + " |"
    sep = "|---|" + "---|" * len(TENSES)
    out += [header, sep]
    pp = passato_prossimo(inf, aux)
    for i, p in enumerate(PRONOUNS):
        cells = []
        for name, endings in TENSES:
            if endings is None:
                cells.append(pp[i])
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append(join(inf, endings[i]))
        out.append(f"| **{p}** | " + " | ".join(cells) + " |")
    out.append("")
    return out


def main(path):
    L = []
    L += [
        "# The 50 Most Common Regular -are Verbs",
        "",
        "A conjugation reference for the most frequently used **regular** Italian verbs ending in *-are*.",
        "The irregular -are verbs (**andare, dare, fare, stare**) are deliberately left out.",
        "",
        "## The tenses",
        "",
        "- **Presente** — the present. What happens now, habits, and often the near future.",
        "  *Parlo italiano.* · *Ogni giorno lavoro fino alle sei.* · *Domani ti chiamo.*",
        "- **Passato prossimo** — the everyday past for completed actions. Formed with *avere* or *essere* + participle.",
        "  With *essere* the participle agrees with the subject: *sono arrivato/arrivata*, *siamo arrivati/arrivate*.",
        "  Some verbs take both, shown as *ho cominciato · sono cominciato/a*.",
        "  *Ieri ho mangiato al ristorante.* · *Sono tornata a casa tardi.*",
        "- **Imperfetto** — the past for background, descriptions, habits and ongoing actions (\"used to\", \"was …ing\").",
        "  *Da bambino giocavo a calcio.* · *Mentre guardavo la TV, è arrivato Marco.*",
        "- **Futuro** — the future, and also guesses about the present.",
        "  *L'anno prossimo studierò di più.* · *Che ore sono? Saranno le otto.*",
        "- **Condizionale** — \"would\": polite requests, wishes and hypothetical situations.",
        "  *Mangerei volentieri una pizza.* · *Mi aiuteresti?*",
        "- **Imperativo** — commands, requests and invitations. There is no *io* form.",
        "  The *lui/lei* row is the polite **Lei** form, and the *loro* row is the formal plural **Loro**.",
        "  The negative *tu* form uses the infinitive: *non parlare!*",
        "  *Aspetta un attimo!* · *Scusi, parli più piano.* · *Andiamo!*",
        "",
        "## The pattern (parlare)",
        "",
        "All 50 verbs follow these endings, added to the stem (*parl-*):",
        "",
        "| | " + " | ".join(t for t, _ in TENSES) + " |",
        "|---|" + "---|" * len(TENSES),
    ]
    for i, p in enumerate(PRONOUNS):
        cells = []
        for name, endings in TENSES:
            if endings is None:
                cells.append(passato_prossimo("parlare", "avere")[i].replace("parlato", "-ato"))
            elif endings[i] is None:
                cells.append("—")
            else:
                cells.append("-" + endings[i])
        L.append(f"| **{p}** | " + " | ".join(cells) + " |")
    L += [
        "",
        "## Index",
        "",
        "| # | Verb | English | Passato prossimo (io) |",
        "|---|---|---|---|",
    ]
    for j, (inf, eng, aux, _) in enumerate(VERBS, 1):
        flag = ""
        L.append(f"| {j} | **{inf}**{flag} | {eng} | {passato_prossimo(inf, aux)[0]} |")
    L += ["", "## Conjugations", ""]
    for n, (inf, eng, aux, note) in enumerate(VERBS, 1):
        L += verb_section(n, inf, eng, aux, note)
    L += [
    ]
    with open(path, "w") as f:
        f.write("\n".join(L))


if __name__ == "__main__":
    assert len(VERBS) == 50, len(VERBS)
    main(sys.argv[1])
