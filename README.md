# IDX Calc – Wertsicherungsrechner Österreich

Web-App zur Verwaltung von Kunden, Akten und der jährlichen Indexanpassung (Wertsicherung) auf Basis des Verbraucherpreisindex (VPI) für Österreich.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **TailwindCSS 4** für Styling
- **Prisma 7** + SQLite für Persistenz
- **Zod** für Validierung
- **Vitest** für Tests

## Setup

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Prisma Client generieren
npx prisma generate

# 3. Datenbank erstellen / Migrationen anwenden
npx prisma db push

# 4. Seed-Daten laden (3 Beispielkunden mit Akten)
npx tsx prisma/seed.mts

# 5. Dev Server starten
npm run dev
```

App öffnen: [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
src/
├── app/
│   ├── actions/           # Server Actions (CRUD)
│   │   ├── customers.ts
│   │   └── case-files.ts
│   ├── api/
│   │   └── index-data/    # API Route für Indexdaten
│   ├── customers/         # Kundenliste, Detail, Bearbeiten
│   │   ├── [id]/
│   │   │   ├── cases/     # Akten: Detail, Neu, Bearbeiten
│   │   │   │   └── [caseId]/
│   │   │   │       └── case-calculation.tsx  # Berechnungs-UI
│   │   │   ├── edit/
│   │   │   └── page.tsx   # Kundendetail
│   │   ├── new/
│   │   └── page.tsx       # Kundenliste
│   ├── layout.tsx
│   └── page.tsx           # Startseite
├── components/
│   ├── ui/                # Button, Input, Select, Textarea
│   ├── customer-form.tsx
│   └── case-file-form.tsx
├── lib/
│   ├── __tests__/
│   │   └── calculation.test.ts
│   ├── index-provider/
│   │   ├── types.ts       # IndexDataProvider Interface
│   │   ├── mock-provider.ts
│   │   ├── mock-data.ts   # Statische VPI-Daten
│   │   ├── api-provider.ts # API Provider (mit Fallback)
│   │   └── index.ts
│   ├── calculation.ts     # Berechnungslogik
│   ├── db.ts              # Prisma Client Singleton
│   └── schemas.ts         # Zod Schemas
└── generated/prisma/      # Generierter Prisma Client
prisma/
├── schema.prisma
├── migrations/
└── seed.mts
```

## Datenmodell

- **Customer**: id, name, contractDate, defaultIndexKey, notes
- **CaseFile**: id, customerId, title, initialValue, indexKey (optional → nutzt Customer default), notes

## Berechnungslogik

```
Preis_neu = Preis_alt × (Index_aktuell / Index_basis)
```

- **Basisperiode**: Monat/Jahr des Vertragsabschlussdatums (YYYY-MM)
- **Index-Basis**: Indexwert zur Basisperiode
- **Aktueller Index**: Wählbar per Dropdown (Standard: neuester verfügbarer Wert)

Angezeigt werden: neuer Wert, absolute Änderung, prozentuale Änderung.

## Index Provider

Das System nutzt ein `IndexDataProvider`-Interface mit zwei Implementierungen:

1. **MockIndexProvider** (Standard): Statische VPI-Daten (VPI 2020, 2015, 2010) direkt im Code
2. **ApiIndexProvider**: Versuch API-Abruf von Statistik Austria, Fallback auf Mock

Konfiguration über `INDEX_PROVIDER` Environment-Variable:
- `mock` (Standard): Statische Daten
- `api`: API mit Fallback

## Tests

```bash
npm test          # Einmalig
npm run test:watch # Watch mode
```

## Verfügbare Scripts

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Next.js Dev Server |
| `npm run build` | Production Build |
| `npm test` | Vitest Tests ausführen |
| `npm run db:seed` | Seed-Daten laden |
| `npm run db:migrate` | Prisma Migrationen |
