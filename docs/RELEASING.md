# Releasing

[Russian version](RELEASING_RU.md)

First configure the owner: `npm run configure -- GITHUB_USERNAME` (replace the placeholder with the real account). Update the version in `manifest.json`, `package.json`, `package-lock.json` and the first section of `CHANGELOG.md` together. For package/lock, use `npm version 1.0.2 --no-git-tag-version`; edit the manifest and changelog separately. Keep `CHANGELOG_RU.md` in sync.

1. Run the checks in [DEVELOPMENT](DEVELOPMENT.md), commit and push `main`.
2. In GitHub → Settings → Secrets and variables → Actions, create a repository secret named `TERMIX_PLUGIN_SIGNING_KEY` containing the CLI key file's **contents**. This is base64 PKCS8 DER, not a file path. Create the repository variable `REGISTRY_PUBLIC_KEY` with the base64 public key.
3. Actions → Release → Run workflow → Branch: main → Version: `1.0.2` → Run workflow.
4. The workflow checks versions, tests, builds, packages, signs with the official CLI and verifies the signature against the public key. Only then does it create a draft release with both files and publish it. The release needs `contents: write`; the standard `GITHUB_TOKEN` is scoped to this repository.
5. Open Releases → `v1.0.2`, check the `.tmxplug` and `.tmxplug.sig` files, download them and run:

```bash
npx --no-install termix-plugin verify host-web-launcher-1.0.2.tmxplug --key 'YOUR_PUBLIC_KEY'
```

Missing keys, incorrect keys or inconsistent versions prevent publication. Existing tags are never overwritten. After a publication failure, inspect the draft and tag; delete them manually only if the release has not yet been published or indexed. Never replace an already published file; release a new version.

This repository uses its own workflow because the shared official release workflow targets dev branches, merging and optional unsigned community submissions. This project requires signing with its own key and uses a regular `main` branch.

Generate the first key locally with `npx --no-install termix-plugin keygen --out /secure/offline/keys`. The CLI prints the public key and key ID but writes only the private key. The companion workspace's `SETUP_RU.md` contains the complete setup procedure for both projects in Russian; the registry's SIGNING documentation explains its trust model.
