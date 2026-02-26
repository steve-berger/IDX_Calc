import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const mod = await import("../src/generated/prisma/client.ts");
const PrismaClient = mod.PrismaClient;

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.caseFile.deleteMany();
  await prisma.customer.deleteMany();

  const customer1 = await prisma.customer.create({
    data: {
      name: "Müller GmbH",
      defaultIndexKey: "VPI_2020",
      notes: "Hauptmieter Bürogebäude Wien",
      caseFiles: {
        create: [
          {
            title: "Mietvertrag Büro A",
            contractDate: new Date("2020-03-15"),
            initialValue: 2500.0,
            notes: "Monatliche Miete, jährliche Anpassung",
          },
          {
            title: "Mietvertrag Lager B",
            contractDate: new Date("2022-01-01"),
            initialValue: 850.0,
            notes: "Lagerraum EG, späterer Vertrag",
          },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Huber & Partner KG",
      defaultIndexKey: "VPI_2020",
      notes: "Pachtvertrag seit 2021",
      caseFiles: {
        create: [
          {
            title: "Pachtvertrag Geschäftslokal",
            contractDate: new Date("2021-07-01"),
            initialValue: 3200.0,
          },
        ],
      },
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Dr. Schmidt",
      defaultIndexKey: "VPI_2015",
      notes: "Altvertrag mit VPI 2015 Basis",
      caseFiles: {
        create: [
          {
            title: "Ordination Miete",
            contractDate: new Date("2019-01-10"),
            initialValue: 1800.0,
            indexKey: "VPI_2015",
            notes: "Abweichender Index laut Vertrag",
          },
        ],
      },
    },
  });

  console.log("Seed data created:", {
    customer1: customer1.name,
    customer2: customer2.name,
    customer3: customer3.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
