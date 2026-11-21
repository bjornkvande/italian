# Italiano

A flash card PWA for learning Italian (Vite, no framework, no backend), deployed
to GitHub Pages: https://bjornkvande.github.io/italian/

## Principles
- `dictionary/it/*.csv` is the single source of truth. Forms (conjugations,
  plurals, articles, -mente adverbs…) come from rules in `src/lang/it/`, with
  CSV columns only for real exceptions.
- Training (`index.html`, `src/core/train.js`) is the main screen. The grammar pages
  are reference, coloured by the user's ratings.
- Keep the UI minimal: few buttons and choices.

## Layout
Prepared for more languages: generic code is separate from Italian.
- `src/core/`: generic app code: training screen, ratings, shuffle bag,
  difficulties, progress, navigation, speech, CSV parser, PWA.
- `src/pages/`: generic grammar page parts: `grammar-page.js` (subpages, nav,
  colours), `page-helpers.js`, `rating-colors.js`.
- `src/styles/`: CSS.
- `src/lang/it/`: everything Italian. `groups.js` is the list of word groups
  (basics, adjectives, adverbs, nouns, verbs) that navigation, training,
  difficulties and tests read from; its header comment is the checklist for
  adding a group. One module per group turns CSV rows into cards
  `{ id, form, kind, heading, it, en }`: `basics.js`, `adjectives.js`,
  `adverbs.js`, `nouns.js`, `conjugate.js` + `verbs.js` (verbs).
- Grammar pages: `<group>.html` in the root + `src/lang/it/pages/<group>-page.js`.
- `tests/` mirrors `src/`: `core/`, `pages/`, `it/`.
- Card ids must stay stable: ratings in localStorage (`verbi.*` keys) are stored by id.
- Not yet language-neutral (for when a second language comes): `core/train.js`
  and `core/nav.js` import the Italian `groups.js`; card ids, storage keys,
  root HTML pages and the app name/manifest are Italian-only.

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
