import { z } from "zod/v4";

export const customerSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  defaultIndexKey: z.string().min(1, "Index-Auswahl ist erforderlich"),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export const caseFileSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  contractDate: z.string().min(1, "Vertragsabschlussdatum ist erforderlich"),
  initialValue: z.coerce
    .number({ error: "Bitte eine gültige Zahl eingeben" })
    .positive("Anfangswert muss positiv sein"),
  indexKey: z.string().optional(),
  notes: z.string().optional(),
});

export type CaseFileFormData = z.infer<typeof caseFileSchema>;
