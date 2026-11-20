# Italiano

A flash card PWA for learning Italian (Vite, no framework, no backend), deployed
to GitHub Pages: https://bjornkvande.github.io/italian/

## Principles
- `dictionary/*.csv` is the single source of truth. Forms (conjugations,
  plurals, articles, -mente adverbs…) come from rules in `src/`, with CSV
  columns only for real exceptions.
- Training (`index.html`, `src/train.js`) is the main screen. The grammar pages
  are reference, coloured by the user's ratings.
- Keep the UI minimal: few buttons and choices.

## Layout
- `src/groups.js`: the list of word groups (basics, adjectives, adverbs, nouns,
  verbs). Navigation, training, difficulties and tests read from it. Its header
  comment is the checklist for adding a group.
- One module per group turns CSV rows into cards
  `{ id, form, kind, heading, it, en }`: `src/basics.js`, `adjectives.js`,
  `adverbs.js`, `nouns.js`, `conjugate.js` (verbs).
- Grammar pages: `<group>.html` + `src/<group>-page.js`, built on
  `src/grammar-page.js` (subpages, nav, colours) and `src/page-helpers.js`.
- Card ids must stay stable: ratings in localStorage (`verbi.*` keys) are stored by id.

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
