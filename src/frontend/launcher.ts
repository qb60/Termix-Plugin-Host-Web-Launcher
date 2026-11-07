import type {
  HostActionContribution,
  PluginHostRecord,
} from "@termix-ssh/plugin-sdk/frontend";

export const PLUGIN_ID = "host-web-launcher";
export type Endpoint = {
  protocol?: unknown;
  port?: unknown;
  path?: unknown;
  hostname?: unknown;
  label?: unknown;
};
export type UrlErrorCode = "protocol" | "address" | "port" | "path";
export class UrlError extends Error {
  code: UrlErrorCode;
  constructor(code: UrlErrorCode) {
    super(code);
    this.code = code;
  }
}

/** No DNS lookup: the user's browser resolves and connects to this address. */
export function buildUrl(address: unknown, endpoint: Endpoint): string {
  const protocol =
    endpoint.protocol === undefined ? "https" : endpoint.protocol;
  if (protocol !== "http" && protocol !== "https")
    throw new UrlError("protocol");
  const override = endpoint.hostname;
  if (override !== undefined && typeof override !== "string")
    throw new UrlError("address");
  const value =
    typeof override === "string" && override.trim() ? override : address;
  if (typeof value !== "string") throw new UrlError("address");
  let host = value.trim();
  if (!host || /[\s/@?#\\%]/u.test(host)) throw new UrlError("address");
  if (host.includes(":")) {
    // Colons are allowed only as an IPv6 literal, never as an embedded port.
    if (!host.startsWith("[")) host = `[${host}]`;
    if (!/^\[[0-9a-f:.]+\]$/i.test(host)) throw new UrlError("address");
  } else if (host.includes("[") || host.includes("]"))
    throw new UrlError("address");
  let url: URL;
  try {
    url = new URL(`${protocol}://${host}/`);
  } catch {
    throw new UrlError("address");
  }
  if (!url.hostname.startsWith("[")) {
    const name = url.hostname.replace(/\.$/, "");
    if (
      name.length > 253 ||
      !name
        .split(".")
        .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))
    )
      throw new UrlError("address");
    // Reject WHATWG's legacy octal, hexadecimal and shortened IPv4 forms.
    if (/^[0-9.]+$/.test(url.hostname) && host !== url.hostname)
      throw new UrlError("address");
  }
  const port = endpoint.port;
  if (port !== undefined && port !== null && port !== "") {
    if (
      (typeof port !== "number" && typeof port !== "string") ||
      !/^\d+$/.test(String(port)) ||
      !Number.isInteger(Number(port)) ||
      Number(port) < 1 ||
      Number(port) > 65535
    )
      throw new UrlError("port");
    url.port = String(Number(port));
  }
  const rawPath = endpoint.path ?? "/";
  if (
    typeof rawPath !== "string" ||
    /[\x00-\x1f\x7f\\]/.test(rawPath) ||
    /%(?![0-9a-f]{2})/i.test(rawPath)
  )
    throw new UrlError("path");
  const path = rawPath.trim() || "/";
  // Always resolve as an absolute path under the validated origin.
  const result = new URL(path.startsWith("/") ? `/.${path}` : `/${path}`, url);
  if (result.origin !== url.origin) throw new UrlError("path");
  return result.href;
}

export function settingsOf(
  host: Pick<PluginHostRecord, "pluginSettings">,
): Record<string, unknown> {
  return host.pluginSettings?.[PLUGIN_ID] ?? {};
}

export function createHostAction(
  icon: HostActionContribution["icon"],
  report: (code: UrlErrorCode | "open") => void,
): HostActionContribution {
  return {
    id: "host-web-launcher-open",
    titleKey: "open",
    icon,
    kind: "open",
    order: 81,
    when: (host) => settingsOf(host).enabled === true,
    label: (host) => {
      const label = settingsOf(host).label;
      return typeof label === "string" && label.trim()
        ? label.trim()
        : undefined;
    },
    run: (host) => {
      if (settingsOf(host).enabled !== true) return;
      try {
        const url = buildUrl(host.ip, settingsOf(host));
        // No await, timers, blank tabs or shell API: preserve the click gesture.
        window.open(url, "_blank", "noopener,noreferrer");
        // A null handle is normal with noopener, so it cannot detect blocking.
      } catch (error) {
        report(error instanceof UrlError ? error.code : "open");
      }
    },
  };
}
