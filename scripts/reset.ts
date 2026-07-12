// Quick DB reset script
import { db } from "../src/lib/db";

async function main() {
  await db.product.updateMany({ data: { status: "available" } });
  await db.order.deleteMany();
  await db.supportMessage.deleteMany();
  console.log("✅ Reset done — all products available, orders and messages cleared");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
