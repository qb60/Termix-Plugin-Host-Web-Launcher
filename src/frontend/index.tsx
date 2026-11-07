import type { TermixApp } from "@termix-ssh/plugin-sdk/frontend";
import { Globe } from "lucide-react";
import i18next from "i18next";
import { toast } from "sonner";
import { createHostAction } from "./launcher";

export function activate(app: TermixApp): void {
  app.registerHostAction(
    createHostAction(Globe, (code) => {
      toast.error(i18next.t(`host-web-launcher:errors.${code}`));
    }),
  );
}
