<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Canonical Bible text comes from bolls.life in the browser and is cached per chapter in IndexedDB (idb-keyval); extra books are bundled excerpts in src/data/extra-texts.ts — keeps reading offline without a backend.
- Offline shell uses vite-plugin-pwa (generateSW, /sw.js) registered only via src/lib/register-sw.ts, which refuses dev/preview hosts — prevents stale caches in the editor.
- Reader appearance is scoped through reader-shell and reader-sheet tokens; scroll visibility lives in useReaderHeader — preserves other pages and makes navigation behavior independently testable.
