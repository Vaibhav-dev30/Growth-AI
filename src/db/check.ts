import { prisma } from './client';

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        company: true,
        status: true,
        matchScore: true
      }
    });
    console.log('--- JOBS ---');
    console.log(`Total jobs: ${jobs.length}`);
    console.log(JSON.stringify(jobs.slice(0, 5), null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
