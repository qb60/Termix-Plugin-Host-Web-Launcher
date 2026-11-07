import { Globe } from "lucide-react";
import { useId } from "react";
import {
  useTranslation,
  type HostEditorSectionProps,
} from "@termix-ssh/plugin-sdk/frontend";
import {
  Button,
  Switch,
  Input,
  SectionCard,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SettingRow,
} from "@termix-ssh/plugin-sdk/ui";
import {
  buildUrl,
  endpointsOf,
  PLUGIN_ID,
  settingsOf,
  UrlError,
  type Endpoint,
} from "./launcher";

export function HostEditorSection({
  form,
  updateForm,
}: HostEditorSectionProps) {
  const { t } = useTranslation();
  const id = useId();
  const settings = settingsOf(form);
  const endpoints = endpointsOf(form);
  const enabled = settings.enabled === true;
  const setSettings = (patch: Record<string, unknown>) =>
    updateForm((current) => {
      const all = (current.pluginSettings ?? {}) as Record<
        string,
        Record<string, unknown>
      >;
      return {
        ...current,
        pluginSettings: {
          ...all,
          [PLUGIN_ID]: { ...all[PLUGIN_ID], ...patch },
        },
      };
    });
  const update = (index: number, patch: Partial<Endpoint>) =>
    setSettings({
      endpoints: endpoints.map((endpoint, i) =>
        i === index ? { ...endpoint, ...patch } : endpoint,
      ),
    });

  return (
    <>
      <SectionCard title={t("title")} icon={<Globe className="size-3.5" />}>
        <div className="flex flex-col gap-4 py-3">
          <SettingRow label={t("enabled")} description={t("enabledHelp")}>
            <Switch
              aria-label={t("enabled")}
              checked={enabled}
              onCheckedChange={(value: boolean) =>
                setSettings({ enabled: value })
              }
            />
          </SettingRow>
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 border border-border space-y-1">
            <p>{t("help")}</p>
          </div>
        </div>
      </SectionCard>
      <SectionCard
        title={t("endpoints")}
        icon={<Globe className="size-3.5" />}
        action={
          enabled ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2 border-accent-brand/40 text-accent-brand"
              onClick={() =>
                setSettings({
                  endpoints: [
                    ...endpoints,
                    {
                      label: `Web ${endpoints.length + 1}`,
                      protocol: "https",
                      path: "/",
                    },
                  ],
                })
              }
            >
              {t("addEndpoint")}
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-3 py-3">
          {!enabled ? (
            <p className="text-xs text-muted-foreground">
              {t("endpointsDisabled")}
            </p>
          ) : endpoints.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("noEndpoints")}</p>
          ) : (
            endpoints.map((endpoint, index) => {
              let error: string | undefined;
              try {
                buildUrl(form.ip || "example.com", endpoint);
              } catch (cause) {
                error = cause instanceof UrlError ? cause.code : "open";
              }
              return (
                <div
                  key={index}
                  role="group"
                  aria-labelledby={`${id}-${index}-heading`}
                  className="flex flex-col gap-3 p-3 border border-border bg-muted/20 relative group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      id={`${id}-${index}-heading`}
                      className="text-xs font-bold text-muted-foreground"
                    >
                      {t("endpoint", { number: index + 1 })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={t("removeEndpoint", { number: index + 1 })}
                      className="h-6 text-[10px] px-2 text-destructive"
                      onClick={() =>
                        setSettings({
                          endpoints: endpoints.filter((_, i) => i !== index),
                        })
                      }
                    >
                      {t("delete")}
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${id}-${index}-label`}
                      className="text-[10px] font-bold text-muted-foreground"
                    >
                      {t("label")}
                    </label>
                    <Input
                      id={`${id}-${index}-label`}
                      value={
                        typeof endpoint.label === "string" ? endpoint.label : ""
                      }
                      onChange={(event) =>
                        update(index, { label: event.target.value })
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                  {error && (
                    <p role="alert" className="text-[11px] text-destructive">
                      {t(`errors.${error}`)}
                    </p>
                  )}
                  <div
                    className="flex flex-col gap-1.5"
                    role="group"
                    aria-labelledby={`${id}-${index}-address`}
                  >
                    <span
                      id={`${id}-${index}-address`}
                      className="text-[10px] font-bold text-muted-foreground"
                    >
                      {t("address")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={endpoint.protocol === "http" ? "http" : "https"}
                        onValueChange={(protocol: string) =>
                          update(index, { protocol })
                        }
                      >
                        <SelectTrigger
                          aria-label={t("protocol")}
                          size="sm"
                          className="h-7 w-24 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="https" className="text-xs">
                            https
                          </SelectItem>
                          <SelectItem value="http" className="text-xs">
                            http
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        aria-label={t("port")}
                        type="number"
                        min={1}
                        max={65535}
                        step={1}
                        value={
                          typeof endpoint.port === "number" ||
                          typeof endpoint.port === "string"
                            ? endpoint.port
                            : ""
                        }
                        onChange={(event) =>
                          update(index, { port: event.target.value })
                        }
                        className="h-7 w-20 text-xs"
                      />
                      <Input
                        aria-label={t("path")}
                        value={
                          typeof endpoint.path === "string"
                            ? endpoint.path
                            : "/"
                        }
                        onChange={(event) =>
                          update(index, { path: event.target.value })
                        }
                        className="h-7 flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${id}-${index}-hostname`}
                      className="text-[10px] font-bold text-muted-foreground"
                    >
                      {t("hostname")}
                    </label>
                    <Input
                      id={`${id}-${index}-hostname`}
                      value={
                        typeof endpoint.hostname === "string"
                          ? endpoint.hostname
                          : ""
                      }
                      onChange={(event) =>
                        update(index, { hostname: event.target.value })
                      }
                      className="h-7 text-xs"
                    />
                    <p className="text-[11px] opacity-70">
                      {t("hostnameHelp")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </>
  );
}
