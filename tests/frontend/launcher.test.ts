import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildUrl,
  endpointsOf,
  createHostAction,
  PLUGIN_ID,
  settingsOf,
} from "../../src/frontend/launcher";
import type {
  PluginHostRecord,
  ShellApi,
} from "@termix-ssh/plugin-sdk/frontend";
import manifest from "../../manifest.json";
import { validateManifest } from "@termix-ssh/plugin-sdk/manifest";

const host = (settings: Record<string, unknown> = {}): PluginHostRecord => ({
  id: "1",
  name: "Server",
  ip: "192.168.1.20",
  port: 22,
  pluginSettings: { [PLUGIN_ID]: { enabled: true, ...settings } },
});
afterEach(() => vi.restoreAllMocks());
describe("URL construction", () => {
  it.each([
    ["example.com", { protocol: "http" }, "http://example.com/"],
    ["example.com", {}, "https://example.com/"],
    ["192.168.1.20", { port: 8006 }, "https://192.168.1.20:8006/"],
    [
      "server.example.com",
      { protocol: "http", port: 9000, path: "/admin" },
      "http://server.example.com:9000/admin",
    ],
    ["example.com", { protocol: "https", port: 443 }, "https://example.com/"],
    ["example.com", { protocol: "http", port: "80" }, "http://example.com/"],
    ["example.com", { port: "" }, "https://example.com/"],
    ["::1", { port: 8006 }, "https://[::1]:8006/"],
    ["[2001:db8::1]", {}, "https://[2001:db8::1]/"],
    ["  example.com  ", { path: "" }, "https://example.com/"],
    [
      "example.com",
      { path: "admin?q=a%20b#section" },
      "https://example.com/admin?q=a%20b#section",
    ],
    [
      "example.com",
      { path: "/space here/привет" },
      "https://example.com/space%20here/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82",
    ],
    [
      "example.com",
      { path: "/x%2Fy?x=1#end" },
      "https://example.com/x%2Fy?x=1#end",
    ],
    [
      "ssh.example.com",
      { hostname: "web.example.com" },
      "https://web.example.com/",
    ],
    ["ssh.example.com", { hostname: " " }, "https://ssh.example.com/"],
    [
      "example.com",
      { path: "//evil.example/path" },
      "https://example.com//evil.example/path",
    ],
  ])("builds %s with %j", (address, endpoint, expected) =>
    expect(buildUrl(address, endpoint)).toBe(expected),
  );
  it.each([
    "",
    "bad host",
    "https://example.com",
    "user@example.com",
    "example.com:443",
    "[::1]:443",
    "bad..name",
    "-bad.example",
    "999.0.0.1",
    "127.1",
    "0x7f000001",
    "[invalid]",
    "exa%6dple.com",
    "example.com/path",
  ])("rejects address %s", (address) =>
    expect(() => buildUrl(address, {})).toThrow(),
  );
  it.each([0, -1, 65536, 1.5, "8e3", " 80", true, {}, "abc"])(
    "rejects port %j",
    (port) => expect(() => buildUrl("example.com", { port })).toThrow("port"),
  );
  it.each(["javascript", "data", "file", "ftp", "HTTPS", "https:"])(
    "rejects protocol %s",
    (protocol) =>
      expect(() => buildUrl("example.com", { protocol })).toThrow("protocol"),
  );
  it.each(["/bad%escape", "/bad\\path", "/line\nnext"])(
    "rejects malformed path %s",
    (path) => expect(() => buildUrl("example.com", { path })).toThrow("path"),
  );
});
it("opens synchronously and preserves the existing page without using shell tabs", () => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  const before = window.location.href;
  const shell = {
    openTab: vi.fn(),
    openSingletonTab: vi.fn(),
  } as unknown as ShellApi;
  const report = vi.fn();
  const action = createHostAction(() => null, report);
  expect(
    action.items!(host({ port: 8006 }))[0].run(host({ port: 8006 }), shell),
  ).toBeUndefined();
  expect(open).toHaveBeenCalledExactlyOnceWith(
    "https://192.168.1.20:8006/",
    "_blank",
    "noopener,noreferrer",
  );
  expect(window.location.href).toBe(before);
  expect(shell.openTab).not.toHaveBeenCalled();
  expect(shell.openSingletonTab).not.toHaveBeenCalled();
  expect(report).not.toHaveBeenCalled();
});
it("hides disabled hosts and never opens them", () => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  const action = createHostAction(() => null, vi.fn());
  expect(action.when(host({ enabled: false }))).toBe(false);
  expect(action.items!(host({ enabled: false }))).toEqual([]);
  expect(open).not.toHaveBeenCalled();
});
it("reports invalid configuration before opening any tab", () => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  const report = vi.fn();
  const record = host({ port: 0 });
  createHostAction(() => null, report).items!(record)[0].run(
    record,
    {} as ShellApi,
  );
  expect(report).toHaveBeenCalledWith("port");
  expect(open).not.toHaveBeenCalled();
});
it("reads the persisted namespace without mutating the host or upstream settings", () => {
  const record = host({
    label: "Proxmox",
    hostname: "web.example.com",
    port: 8006,
  });
  record.pluginSettings!["web-endpoint"] = {
    enableWebUi: true,
    webUiConfig: { endpoints: [{ port: 9000 }] },
  };
  const saved = JSON.stringify(record);
  const restored = JSON.parse(saved) as PluginHostRecord;
  expect(settingsOf(restored).port).toBe(8006);
  expect(buildUrl(restored.ip, settingsOf(restored))).toBe(
    "https://web.example.com:8006/",
  );
  expect(JSON.stringify(restored)).toBe(saved);
  expect(createHostAction(() => null, vi.fn()).label?.(restored)).toBe(
    "Proxmox",
  );
});
it("passes the official manifest validator with only UI capability", () => {
  expect(validateManifest(manifest)).toEqual([]);
  expect(manifest.id).toBe(PLUGIN_ID);
  expect(manifest.capabilities).toEqual(["ui:surface"]);
  expect("dependencies" in manifest).toBe(false);
  expect("tabs" in manifest.contributes).toBe(false);
  expect(
    manifest.contributes.settings.host.fields.find(
      (field) => field.key === "endpoints",
    )?.type,
  ).toBe("json");
});

it("offers one picker item per endpoint and opens only the chosen target", () => {
  const record = host({
    endpoints: [
      { label: "Proxmox", port: 8006 },
      { label: "Metrics", protocol: "http", port: 9000, path: "/metrics" },
    ],
  });
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  const report = vi.fn();
  const action = createHostAction(() => null, report);
  expect(action.when(record)).toBe(true);
  expect(action.label?.(record)).toBeUndefined();
  const items = action.items!(record);
  expect(items.map((item) => item.label)).toEqual(["Proxmox", "Metrics"]);
  expect(new Set(items.map((item) => item.id)).size).toBe(2);
  items[1].run(record, {} as ShellApi);
  expect(open).toHaveBeenCalledExactlyOnceWith(
    "http://192.168.1.20:9000/metrics",
    "_blank",
    "noopener,noreferrer",
  );
  items[0].run(host({ enabled: false }), {} as ShellApi);
  expect(open).toHaveBeenCalledTimes(1);
  expect(report).not.toHaveBeenCalled();
});
it("keeps an explicitly empty list empty instead of reviving legacy fields", () => {
  const record = host({ port: 8006, endpoints: [] });
  expect(endpointsOf(record)).toEqual([]);
  expect(createHostAction(() => null, vi.fn()).when(record)).toBe(false);
});
it.each([null, "bad", {}, [null, 1, "bad", []]])(
  "ignores malformed endpoint lists %j",
  (endpoints) => {
    expect(endpointsOf(host({ endpoints }))).toEqual([]);
  },
);
