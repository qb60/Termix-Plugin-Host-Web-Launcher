# Sources and decisions

[Russian version](UPSTREAM_RU.md)

Initially researched on November 6, 2026; `main` sources may change. Runtime and CLI contracts are pinned by `@termix-ssh/plugin-sdk` 1.0.20 and the npm lockfile.

- [Plugin-Web-Endpoint](https://github.com/Termix-SSH/Plugin-Web-Endpoint): `src/frontend/index.tsx`, `endpoints.ts`, `HostEditorWebUiSection.tsx`, `web-endpoint-api.ts`, manifest/package. Host action, host record and namespace conventions, the editor's endpoint list and the picker through `HostActionContribution.items` informed this implementation. Proxies, tunnels and embedded surfaces were not ported.
- [Official frontend contract](https://github.com/Termix-SSH/Termix/blob/main/packages/plugin-sdk/src/frontend.ts): `PluginHostRecord.ip`, `pluginSettings` and synchronous host action callbacks.
- [Core action invocation](https://github.com/Termix-SSH/Termix/blob/main/src/ui/sidebar/host-contributions.ts): `runHostAction` invokes the action directly, without `await` or a timer.
- [Desktop](https://github.com/Termix-SSH/Termix/blob/main/electron/main.cjs): `setWindowOpenHandler` calls `shell.openExternal` for HTTP/HTTPS and prevents a new Electron window. This is source analysis, not a GUI test.
- [Settings](https://docs.termix.site/develop/settings/): declarative host settings get automatic forms and persistence. The endpoint list uses a custom section in the top group, available even for hosts without SSH, and a hidden JSON field named `endpoints` for core persistence. The original Web Endpoint section is in the SSH group.
- [Manifest](https://docs.termix.site/develop/manifest/), [Frontend](https://docs.termix.site/develop/frontend/), [Permissions](https://docs.termix.site/develop/permissions/), [Testing](https://docs.termix.site/develop/testing/), [Releasing](https://docs.termix.site/develop/releasing/), [Registries](https://docs.termix.site/develop/registries/).

Documentation differences: the Manifest page mentioned API 1.2, while the examined `manifest.ts` contained API 1.13.0. The conservative minimum of `^1.9` and Termix `>=26.10.3` follows the upstream host action contract used here rather than assuming the current core version matches the documentation. The installed CLI also validates the published package.

SDK CLI 1.0.20's `commands/build.mjs` refuses to build a code plugin without `src/backend/index.*`; `commands/pack.mjs` requires `dist/backend.js`. A completely frontend-only package therefore cannot be built with this CLI. The only backend export is an empty `activate()`. It creates no routes, tables, services, SSH connections or timers. The `hosts:read` capability is unnecessary because the plugin does not call the backend hosts API.

The referenced [Plugin-Template](https://github.com/Termix-SSH/Plugin-Template) returned HTTP 404 during the initial research, including a direct request for raw package.json. Contracts were checked against the available Web Endpoint sources and installed SDK rather than assuming the unavailable template's contents.

The project is a reduced, independent implementation. LICENSE/NOTICE retain upstream attribution; packaging includes the license in `.tmxplug`. For publication as a fork, sections 2–5 of the companion workspace's `SETUP_RU.md` describe creating and cloning a fork, then replacing its working tree with the prepared sources in a separate commit while retaining `.git`, LICENSE/NOTICE and upstream history. The prepared source archive alone contains no Git history. GitHub establishes the fork relationship when the fork is created; adding an `upstream` remote supports local work with the original repository.
