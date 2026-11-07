import { useState } from "react";
import { fireEvent, render, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { HostEditorSection } from "../../src/frontend/HostEditorSection";
import { endpointsOf, settingsOf } from "../../src/frontend/launcher";

it("edits legacy settings as a list, preserves other settings and can remove every endpoint", () => {
  let saved: Record<string, unknown> = {};
  function Editor() {
    const [form, setForm] = useState<Record<string, unknown>>({
      ip: "example.com",
      name: "Server",
      pluginSettings: {
        "host-web-launcher": { enabled: true, label: "Admin", port: 8006 },
        "web-endpoint": { enableWebUi: true },
      },
    });
    saved = form;
    return (
      <HostEditorSection
        form={form}
        updateForm={setForm}
        setField={() => {}}
        protocols={{ enableSsh: false }}
      />
    );
  }
  const view = render(<Editor />);
  const ui = within(view.container);
  expect(ui.getByDisplayValue("Admin")).toBeTruthy();
  fireEvent.click(ui.getByRole("button", { name: "addEndpoint" }));
  expect(endpointsOf(saved)).toHaveLength(2);
  fireEvent.change(ui.getAllByLabelText("label")[1], {
    target: { value: "Metrics" },
  });
  fireEvent.change(ui.getAllByLabelText("port")[1], {
    target: { value: "9000" },
  });
  expect(endpointsOf(saved)[1]).toMatchObject({
    label: "Metrics",
    port: "9000",
  });
  fireEvent.change(ui.getAllByLabelText("port")[1], {
    target: { value: "65536" },
  });
  expect(ui.getByRole("alert").textContent).toBe("errors.port");
  fireEvent.change(ui.getAllByLabelText("port")[1], { target: { value: "" } });
  expect(ui.queryByRole("alert")).toBeNull();
  fireEvent.click(ui.getByRole("switch", { name: "enabled" }));
  expect(settingsOf(saved).enabled).toBe(false);
  expect(ui.queryByRole("button", { name: "addEndpoint" })).toBeNull();
  fireEvent.click(ui.getByRole("switch", { name: "enabled" }));
  expect(endpointsOf(saved)).toHaveLength(2);
  expect(settingsOf(saved).enabled).toBe(true);
  expect(saved.name).toBe("Server");
  expect(
    (saved.pluginSettings as Record<string, unknown>)["web-endpoint"],
  ).toEqual({ enableWebUi: true });
  fireEvent.click(ui.getAllByRole("button", { name: "removeEndpoint" })[0]);
  expect(endpointsOf(saved)[0].label).toBe("Metrics");
  fireEvent.click(ui.getByRole("button", { name: "removeEndpoint" }));
  expect(endpointsOf(JSON.parse(JSON.stringify(saved)))).toEqual([]);
  view.unmount();
});
