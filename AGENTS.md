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

- App state lives in a localStorage-backed store (src/lib/store.ts) with no backend; why: the KARTAVYA hackathon demo has to run without Lovable Cloud. Move to Cloud tables before real users.
- Billing math lives only in src/lib/pricing.ts and is covered by src/test/pricing.test.ts; why: prices must be consistent everywhere.
