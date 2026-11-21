# Italiano

A flash card PWA for learning Italian, and now German (Vite, no framework, no
backend), deployed to GitHub Pages: https://bjornkvande.github.io/italian/
The app keeps the name "Italiano".

## Principles
- `dictionary/<code>/*.csv` is the single source of truth. Forms (conjugations,
  plurals, articles, -mente adverbs…) come from rules in `src/lang/<code>/`,
  with CSV columns only for real exceptions.
- Italian must not be affected by other languages: same card ids, storage keys
  (`verbi.*`), pages and progress.
- Training (`index.html`, `src/core/train.js`) is the main screen. The grammar pages
  are reference, coloured by the user's ratings.
- Keep the UI minimal: few buttons and choices.

## Layout
Generic code is separate from each language's content.
- `src/core/`: generic app code: training screen, ratings, shuffle bag,
  difficulties, progress, navigation, speech, CSV parser, PWA.
  `language.js` lists the languages and picks the current one: a grammar page
  says it in `<body data-lang="de">`, the Train screen uses the one chosen with
  the flag (stored in `verbi.language`, Italian by default).
- `src/pages/`: generic grammar page parts: `grammar-page.js` (subpages, nav,
  colours, footer), `page-helpers.js`, `rating-colors.js`, `footer.js`.
- `src/styles/`: CSS.
- `src/lang/<code>/`: one folder per language. `language.js` has its settings
  (name, flag, speech voice, storage `prefix`, pages `dir`, groups);
  `groups.js` is its list of word groups that navigation, training,
  difficulties and tests read from (the header comment of `src/lang/it/groups.js`
  is the checklist for adding a group). One module per group turns CSV rows
  into cards `{ id, form, kind, heading, it, en }`; `it` is the side in the
  language being learned and directions are "it-en"/"en-it" for every language
  (named when Italian was the only one).
- Italian (`it`): prefix `verbi.`, pages in the root (`basics.html`, `are.html`…),
  groups basics, adjectives, adverbs, nouns, verbs.
- German (`de`): prefix `de.`, pages in `de/`. So far only the Basics; nouns,
  verbs, adjectives and adverbs come next, in stages.
- Grammar pages: an HTML file per page + `src/lang/<code>/pages/<group>-page.js`.
- `tests/` mirrors `src/`: `core/`, `pages/`, `it/`, `de/`.
- Card ids must stay stable: ratings are stored by id.

## Working here
- Node 26 via direnv: run commands as `source .envrc >/dev/null && npm test`.
- `npm run dev` stays running on port 5173. Don't stop it, and never touch its
  localStorage (it holds the user's real ratings).
- Check changes with `npm test` (+ `npm run build`). No browser checks; the
  user tests the app.
- Tests: write expected forms from grammar, not copied from the code. Shared
  helpers are in `tests/helpers.js`.
- Commit and push only when asked. Pushing to main deploys (gitleaks scan, tests,
  build, Pages).
