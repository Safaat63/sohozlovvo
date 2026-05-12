import { prisma } from "./src/lib/prisma";

async function test() {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: {
        slug: "mango",
        isActive: true,
        isPublished: true,
      },
    });
    console.log("Success:", landingPage);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
