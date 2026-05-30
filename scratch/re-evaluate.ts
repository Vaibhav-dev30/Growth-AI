import { prisma } from '../src/db/client';
import { AIService } from '../src/services/ai/gemini';
import { logger } from '../src/utils/logger';
import { config } from 'dotenv';

config();

async function main() {
  logger.info('Re-evaluating all jobs in database...');
  
  const user = await prisma.user.findFirst();
  if (!user) {
    logger.error('No user found in database!');
    return;
  }
  
  const jobs = await prisma.job.findMany();
  logger.info(`Found ${jobs.length} jobs to re-evaluate.`);
  
  const threshold = parseInt(process.env.MATCH_THRESHOLD || '75', 10);
  
  let matchedCount = 0;
  let rejectedCount = 0;

  for (const job of jobs) {
    const matchResult = await AIService.evaluateMatch(
      `Title: ${job.title}\nDescription: ${job.description}`,
      user.rawProfile || user.skills
    );
    
    let status = 'MATCHED';
    if (matchResult.score < threshold) {
      status = 'REJECTED';
      rejectedCount++;
    } else {
      matchedCount++;
    }
    
    await prisma.job.update({
      where: { id: job.id },
      data: {
        matchScore: matchResult.score,
        matchReasoning: matchResult.reasoning,
        status
      }
    });
  }
  
  logger.info(`Re-evaluation complete! MATCHED: ${matchedCount}, REJECTED: ${rejectedCount}`);
}

main()
  .catch(err => {
    logger.error('Error during re-evaluation', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
