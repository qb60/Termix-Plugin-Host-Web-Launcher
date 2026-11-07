# Installation and verification

[Russian version](INSTALLATION_RU.md)

The primary installation path is a trusted custom registry. Once it is published, a Termix administrator opens Plugins → Registries → Add registry, enters `https://GITHUB_USERNAME.github.io/Termix-Plugins-Registry/index.json`, clicks Check, confirms the key ID with the owner and selects Trust and add. In Browse, find Host Web Launcher, click Install, then Enable if the plugin is still disabled.

In the host editor, open Host Web Launcher, turn on the switch and add endpoints. For each endpoint, set the service label, protocol, port and path. Save. The action beside the host opens a single URL immediately or shows a service picker. Leave the port empty to use the protocol's default. A separate web hostname does not change the SSH address.

For local development, install a file through Plugins → Install from file with developer mode enabled. Termix treats manually installed files as unverified, even when signed; registry installation provides trust and automatic updates. A local file installation does not verify the trusted registry installation path.

To use both plugins, install Web Endpoint separately from the official registry. It has its own settings; Host Web Launcher does not require Tunnels. To check persistence, reload the page and reopen the editor.

If no new tab appears, allow popups for the Termix site, check for configuration errors and try the browser interface instead of desktop. If the tab opens but the address is unreachable, check access from your own computer, DNS, port, VPN and certificate. The plugin provides no network access or tunnel and does not disable TLS verification.
