# Development

[Russian version](DEVELOPMENT_RU.md)

Install Git, Node.js 24 LTS and npm. With mise installed, for example, run `mise use --global node@24`, open a new terminal and check `node --version` and `npm --version`.

```bash
npm ci
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run validate
npm run pack
```

Run `build` before CLI `validate`: validation checks that `dist/backend.js` and `dist/frontend.js` exist. Packaging produces `host-web-launcher-1.0.2.tmxplug` in the project root. `node_modules`, `dist` and the package are excluded from Git.

The main logic is in `src/frontend/launcher.ts`; registration and localized notifications are in `src/frontend/index.tsx`. `src/frontend/HostEditorSection.tsx` is registered with `registerHostEditorSection` in the top group and edits the list at `pluginSettings["host-web-launcher"].endpoints`. Fields are declared hidden in the manifest for core validation and persistence; `endpoints` is a JSON field. Legacy flat fields remain declared for compatibility and are read as one endpoint until the list is edited. An empty list does not restore the old fields. The SDK has no separate `contributes.hostActions` manifest field: the host action is registered with `app.registerHostAction`. `contributes.actions` is a different mechanism for exported frontend actions and is unused here.

Activation and reopening the editor do not overwrite saved values. Core supplies defaults; runtime also handles missing protocol and path values. The web port intentionally has no default so HTTP and HTTPS use their own standard ports. An empty port may be stored as `null` or an empty string; both mean the protocol's default port.

`tests/frontend` runs in jsdom through the SDK preset. `renderWithApp` uses real SDK registries; browser opening is mocked. URL tests cover invalid schemes, ports, IPv6, percent encoding and attempts to change the origin through the path. Real popup blockers, DNS, service reachability, database persistence and desktop behavior need manual testing.

For a manual check, enable developer mode in Termix, open Plugins → Install from file and select the `.tmxplug`. The browser should keep the Termix tab, open a separate destination tab and create no workspace tab. Edit the host, save, reload the page and verify the values. Repeat with HTTP, HTTPS, IPv6 and Web Endpoint installed. Check disabled hosts, invalid ports, adding/editing/removing multiple endpoints, the picker and preservation of a legacy single endpoint. With `noopener`, the browser returns `null` even after a successful open; this does not indicate blocking.

Do not add `await` before `window.open`: core's `runHostAction` invokes the action directly. Preserving the user's click gesture depends on this path; programmatic calls without a click may be blocked by the browser.

## Language policy

Write documentation, comments and repository messages in English. Keep Russian documentation as matching `_RU.md` files and link to each Russian copy near the start of its English original. Update both copies when behavior changes. Keep `locales/ru.json` under its standard name so Termix can load the Russian interface translations.
