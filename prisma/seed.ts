import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  "Documents",
  "Electronics",
  "Jewelry",
  "Kitchen",
  "Office",
  "Tools",
  "Miscellaneous",
];

async function main() {
  console.log("Start seeding categories...");
  for (const name of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: name,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: name,
          isCustom: false,
          userId: null,
        },
      });
    }
  }
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
