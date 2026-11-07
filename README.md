# Host Web Launcher

[Russian version](README_RU.md)

Open a host's web interfaces directly in new browser tabs. ID: `host-web-launcher`, version: `1.0.0`, license: Apache-2.0.

See [INSTALLATION](docs/INSTALLATION.md), [DEVELOPMENT](docs/DEVELOPMENT.md) and [RELEASING](docs/RELEASING.md). The companion workspace's `SETUP_RU.md`, one directory above this repository, covers setup and publication of both repositories in Russian.

## Host configuration

1. In Termix, open the host editor and select **Host Web Launcher**. The editor uses the standard Termix UI kit.
2. Turn on the switch. Click **Add endpoint** for each service and set its label, HTTP/HTTPS protocol, web port and path. Endpoints can be edited and removed independently.
3. Optionally specify a separate hostname/IP for the web service. An empty value uses the host's connection address; the SSH port never becomes the web port.
4. Save the host. Click **Open web interface** beside the host or in its menu. With multiple endpoints, choose a service from the picker; a single endpoint opens directly. Allow popups for Termix if your browser blocks them.

Examples:

| Host address         | Protocol | Web port | Path     | URL                                    |
| -------------------- | -------- | -------- | -------- | -------------------------------------- |
| `192.168.1.20`       | HTTPS    | 8006     | `/`      | `https://192.168.1.20:8006/`           |
| `server.example.com` | HTTP     | 9000     | `/admin` | `http://server.example.com:9000/admin` |
| `2001:db8::20`       | HTTPS    | 8006     | `/`      | `https://[2001:db8::20]:8006/`         |

An empty web port means 80 for HTTP and 443 for HTTPS; the standard URL API omits these ports from the URL string. Queries, fragments, Unicode hostnames and paths are supported; valid existing percent encoding is preserved. The address field accepts no protocol, port, path or credentials. IPv6 works with or without brackets. IPv6 zone IDs (`%eth0`) are unsupported by the browser URL API. Shortened, octal and hexadecimal IPv4 forms are rejected.

## Scope and limitations

Supports Termix `>=26.10.3` with API `^1.9` and a regular web browser. The action builds the URL from the already loaded host and calls `window.open(url, "_blank", "noopener,noreferrer")` synchronously, without network requests, timers or preliminary blank tabs. The Termix page stays open. Browser preferences may open a separate window instead of a tab; the plugin cannot override this.

In the desktop Termix sources examined, `setWindowOpenHandler` sends HTTP/HTTPS URLs to the system browser. The plugin uses the same browser call and does not access Electron internals. This behavior depends on the desktop build and has not been tested in a GUI in this environment. The examined frontend SDK has no separate public `openExternal`. For older or modified desktop builds, use Termix's web interface in a regular browser. The mobile app has not been tested.

A host can have multiple endpoints. The host action shows a picker for multiple endpoints and opens a single endpoint immediately. Existing flat settings are read as the first endpoint; editing saves the list in the same namespace. Removing all endpoints hides the host action.

The **user's browser** connects to the destination. Reachability from the Termix server does not guarantee access. A service bound only to the remote host's loopback interface or on an inaccessible network needs separately configured network access. `localhost` refers to the user's computer. The plugin does not change TLS verification or bypass certificate warnings.

## Comparison

| Feature                        | Host Web Launcher                | Official Web Endpoint        |
| ------------------------------ | -------------------------------- | ---------------------------- |
| Main purpose                   | Direct URL in the user's browser | Web interfaces inside Termix |
| SSH tunnels and proxies        | No                               | Yes                          |
| Termix tabs, panels, dashboard | No                               | Yes                          |
| Tunnels dependency             | No                               | Yes in the examined version  |
| Multiple endpoints per host    | Yes                              | Yes                          |
| Settings namespace             | `host-web-launcher`              | `web-endpoint`               |

Both plugins can run together. This plugin's action ID is `host-web-launcher-open`; it does not read or change Web Endpoint settings or routes. There is no migration from Web Endpoint.

## Development

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run validate
npm run pack
```

Requires Node.js 24 LTS. Packaging uses the official `@termix-ssh/plugin-sdk` 1.0.20. This SDK requires a backend entry: `src/backend/index.ts` contains only an empty `activate()`. There are no HTTP routes, tables, SSH connections, services or background tasks. The only capability is `ui:surface`; addresses come from the SDK's host record, so no backend host lookup is needed.

Tests cover URLs, namespaces, browser calls, endpoint editing and the SDK's real registration surfaces. They do not replace testing in a running Termix instance and browser. Termix handles database persistence; local tests check the field contract and restored payloads rather than a real server database.

English is the repository's primary language. Russian documentation uses the `_RU.md` suffix and is linked near the start of each English file. `locales/ru.json` keeps its standard name for Termix's Russian UI localization.

Sources and documentation/SDK differences: [UPSTREAM](docs/UPSTREAM.md). Attribution is preserved in `NOTICE` and `LICENSE`.
