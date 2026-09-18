import { PrismaClient } from "@prisma/client";
import { encryptSecret } from "../src/lib/security";

const db = new PrismaClient();

async function main() {
  const products = (await db.product.findMany()).filter((p) => !p.login.startsWith("enc:v1:") || !p.password.startsWith("enc:v1:"));
  const orders = (await db.order.findMany()).filter((o) => (o.deliveryLogin && !o.deliveryLogin.startsWith("enc:v1:")) || (o.deliveryPass && !o.deliveryPass.startsWith("enc:v1:")) || (o.deliveryNote && !o.deliveryNote.startsWith("enc:v1:")));
  await db.$transaction([
    ...products.map((p) => db.product.update({ where: { id: p.id }, data: { login: encryptSecret(p.login), password: encryptSecret(p.password), deliveryNote: p.deliveryNote ? encryptSecret(p.deliveryNote) : null } })),
    ...orders.map((o) => db.order.update({ where: { id: o.id }, data: { deliveryLogin: o.deliveryLogin ? encryptSecret(o.deliveryLogin) : null, deliveryPass: o.deliveryPass ? encryptSecret(o.deliveryPass) : null, deliveryNote: o.deliveryNote ? encryptSecret(o.deliveryNote) : null } })),
  ]);
  console.log(`Encrypted ${products.length} products and ${orders.length} orders`);
}

main().finally(() => db.$disconnect());
