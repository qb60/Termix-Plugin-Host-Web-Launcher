import { expect, it, vi } from "vitest";
import type { ShellApi } from "@termix-ssh/plugin-sdk/frontend";
import { renderWithApp } from "@termix-ssh/plugin-sdk/testing";
import type { PluginManifest } from "@termix-ssh/plugin-sdk/manifest";
import manifest from "../../manifest.json";
import * as plugin from "../../src/frontend/index";

it("registers a distinct action with the SDK's real registries", async () => {
  const app = await renderWithApp(plugin, {
    manifest: manifest as PluginManifest,
  });
  const host = {
    id: "1",
    name: "Test",
    ip: "example.com",
    port: 22,
    pluginSettings: {
      "host-web-launcher": { enabled: true, protocol: "https", path: "/admin" },
    },
  };
  const actions = app.registered.hostActionsFor(host);
  expect(actions).toHaveLength(1);
  expect(actions[0].id).toContain("host-web-launcher-open");
  expect(app.registered.hostEditorSections()).toHaveLength(1);
  expect(app.registered.tabs()).toEqual([]);
  expect(app.registered.panels()).toEqual([]);
  expect(app.registered.dashboardCards()).toEqual([]);
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  actions[0].items!(host)[0].run(host, {
    openTab: vi.fn(),
  } as unknown as ShellApi);
  expect(open).toHaveBeenCalledWith(
    "https://example.com/admin",
    "_blank",
    "noopener,noreferrer",
  );
  open.mockRestore();
  await app.deactivate();
});
