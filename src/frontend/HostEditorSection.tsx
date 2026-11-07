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
    <SectionCard title={t("title")} icon={<Globe className="size-3.5" />}>
      <div className="flex flex-col gap-3 py-3">
        <SettingRow label={t("enabled")} description={t("help")}>
          <Switch
            aria-label={t("enabled")}
            checked={enabled}
            onCheckedChange={(value: boolean) =>
              setSettings({ enabled: value })
            }
          />
        </SettingRow>
        {enabled && (
          <>
            {endpoints.length === 0 && <p>{t("noEndpoints")}</p>}
            {endpoints.map((endpoint, index) => {
              let error: string | undefined;
              try {
                buildUrl(form.ip || "example.com", endpoint);
              } catch (cause) {
                error = cause instanceof UrlError ? cause.code : "open";
              }
              return (
                <fieldset
                  key={index}
                  className="flex flex-col gap-3 border border-border p-3"
                >
                  <legend>{t("endpoint", { number: index + 1 })}</legend>
                  {(["label", "hostname", "path"] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label htmlFor={`${id}-${index}-${key}`}>{t(key)}</label>
                      <Input
                        id={`${id}-${index}-${key}`}
                        value={
                          typeof endpoint[key] === "string" ? endpoint[key] : ""
                        }
                        onChange={(event) =>
                          update(index, { [key]: event.target.value })
                        }
                      />
                      {key === "hostname" && (
                        <p className="text-xs text-muted-foreground">
                          {t("hostnameHelp")}
                        </p>
                      )}
                    </div>
                  ))}
                  <label htmlFor={`${id}-${index}-protocol`}>
                    {t("protocol")}
                  </label>
                  <Select
                    value={endpoint.protocol === "http" ? "http" : "https"}
                    onValueChange={(protocol: string) =>
                      update(index, { protocol })
                    }
                  >
                    <SelectTrigger id={`${id}-${index}-protocol`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="https">HTTPS</SelectItem>
                    </SelectContent>
                  </Select>
                  <label htmlFor={`${id}-${index}-port`}>{t("port")}</label>
                  <Input
                    id={`${id}-${index}-port`}
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
                  />
                  {error && (
                    <p role="alert" className="text-destructive">
                      {t(`errors.${error}`)}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setSettings({
                        endpoints: endpoints.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {t("removeEndpoint", { number: index + 1 })}
                  </Button>
                </fieldset>
              );
            })}
            <Button
              type="button"
              variant="outline"
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
          </>
        )}
      </div>
    </SectionCard>
  );
}
