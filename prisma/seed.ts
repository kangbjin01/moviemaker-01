import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create demo users without plans (simplified for SQLite)
  const userPromises = [];

  for (let i = 1; i <= 10; i++) {
    const name = `User ${i}`;
    const email = `user${i}@example.com`;

    userPromises.push(
      prisma.user.create({
        data: {
          id: `DEMO_USER_${i}`,
          name: name,
          email: email,
        },
      }),
    );
  }

  await Promise.all(userPromises);
  console.log("10 demo users created.");
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
