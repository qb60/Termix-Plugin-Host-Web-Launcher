import type { TermixApp } from "@termix-ssh/plugin-sdk/frontend";
import { Globe } from "lucide-react";
import i18next from "i18next";
import { toast } from "sonner";
import { createHostAction } from "./launcher";
import { HostEditorSection } from "./HostEditorSection";

export function activate(app: TermixApp): void {
  app.registerHostEditorSection({
    id: "endpoints",
    group: "top",
    titleKey: "title",
    icon: Globe,
    component: HostEditorSection,
  });
  app.registerHostAction(
    createHostAction(Globe, (code) => {
      toast.error(i18next.t(`host-web-launcher:errors.${code}`));
    }),
  );
}
