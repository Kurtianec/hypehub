// Populate `images` field for products — second image for hover effect
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Platform-themed second images (different from primary)
const HOVER_IMAGES = {
  tiktok: [
    "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80",
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80",
    "https://images.unsplash.com/photo-1574629173362-5edaa54e9519?w=600&q=80",
    "https://images.unsplash.com/photo-1620057242255-2f0fb6c5d65f?w=600&q=80",
  ],
  youtube: [
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80",
    "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&q=80",
    "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&q=80",
  ],
  vk: [
    "https://images.unsplash.com/photo-1611162616475-46b635cb6898?w=600&q=80",
    "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
  ],
  telegram: [
    "https://images.unsplash.com/photo-1611605698763-13b7e3a9e1d6?w=600&q=80",
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80",
    "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80",
    "https://images.unsplash.com/photo-1573804637435-c4b3bced5ff7?w=600&q=80",
  ],
  instagram: [
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80",
    "https://images.unsplash.com/photo-1558655146-d09347ac9756?w=600&q=80",
  ],
};

async function main() {
  const products = await db.product.findMany({
    include: { category: true },
  });

  let updated = 0;
  for (const p of products) {
    if (p.images) continue; // Skip if already has images
    const platform = p.category?.platform;
    if (!platform || !HOVER_IMAGES[platform]) continue;

    const pool = HOVER_IMAGES[platform];
    // Use product index for deterministic selection
    const idx = products.indexOf(p) % pool.length;
    const secondImage = pool[idx];

    // Don't use same image as primary
    if (secondImage === p.image) continue;

    await db.product.update({
      where: { id: p.id },
      data: { images: JSON.stringify([secondImage]) },
    });
    updated++;
  }

  console.log(`Updated ${updated} products with hover images`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
