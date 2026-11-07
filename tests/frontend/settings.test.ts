import { expect, it } from "vitest";
import {
  coerceSettingValue,
  defaultsFor,
  validateSettingValue,
} from "@termix-ssh/plugin-sdk/settings";
import type { PluginManifest } from "@termix-ssh/plugin-sdk/manifest";
import manifest from "../../manifest.json";
import { buildUrl, endpointsOf, settingsOf } from "../../src/frontend/launcher";

const schema = (manifest as PluginManifest).contributes!.settings!.host!;
it("uses declared defaults while leaving the port to the selected protocol", () => {
  const defaults = defaultsFor(schema.fields);
  expect(defaults.protocol).toBe("https");
  expect(defaults.path).toBe("/");
  expect(defaults.port).toBeUndefined();
  expect(buildUrl("example.com", { ...defaults, protocol: "http" })).toBe(
    "http://example.com/",
  );
});
it("accepts the core UI's cleared number value and validates saved port types", () => {
  const field = schema.fields.find((f) => f.key === "port")!;
  expect(validateSettingValue(field, null)).toBeNull();
  expect(coerceSettingValue(field, "8006")).toBe(8006);
  expect(validateSettingValue(field, 8006)).toBeNull();
  expect(validateSettingValue(field, 65536)).not.toBeNull();
  expect(buildUrl("example.com", { port: null })).toBe("https://example.com/");
});
it("keeps settings through the core field validation and serialized host payload", () => {
  const saved: Record<string, unknown> = {
    enabled: true,
    label: "Proxmox",
    protocol: "https",
    port: 8006,
    path: "/admin",
    hostname: "web.example.com",
  };
  for (const field of schema.fields)
    expect(validateSettingValue(field, saved[field.key])).toBeNull();
  const host = JSON.parse(
    JSON.stringify({ pluginSettings: { "host-web-launcher": saved } }),
  );
  expect(settingsOf(host)).toEqual(saved);
  expect(buildUrl("192.168.1.20", settingsOf(host))).toBe(
    "https://web.example.com:8006/admin",
  );
});

it("preserves an endpoint list through core validation and JSON persistence", () => {
  const endpoints = [
    { label: "Admin", port: 8006 },
    { label: "Metrics", protocol: "http", port: "9000" },
  ];
  const field = schema.fields.find((field) => field.key === "endpoints")!;
  expect(validateSettingValue(field, endpoints)).toBeNull();
  const restored = JSON.parse(
    JSON.stringify({
      pluginSettings: { "host-web-launcher": { enabled: true, endpoints } },
    }),
  );
  expect(endpointsOf(restored)).toEqual(endpoints);
  expect(
    endpointsOf(restored).map((endpoint) => buildUrl("example.com", endpoint)),
  ).toEqual(["https://example.com:8006/", "http://example.com:9000/"]);
});
