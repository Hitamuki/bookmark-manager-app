/**
 * 開発・テスト用の初期データ投入とデータベース初期化
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * メイン処理
 * データベースに初期データを投入する
 */
async function main() {
  console.log('Seeding started...');
  try {
    await prisma.$connect();
    console.log('Prisma connected to database.');

    // Clear existing data
    await prisma.sample.deleteMany({});
    console.log('Existing data cleared.');
  } catch (error) {
    console.error('Database connection or query failed:', error);
    process.exit(1);
  }

  // Seed Sample data
  await prisma.sample.createMany({
    data: [
      { title: 'Sample 1', createdBy: 'e2e_test_user' },
      { title: 'Sample 2', createdBy: 'e2e_test_user' },
      { title: 'Sample 3', createdBy: 'e2e_test_user' },
    ],
  });
  console.log('Sample data created.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished successfully.');
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
