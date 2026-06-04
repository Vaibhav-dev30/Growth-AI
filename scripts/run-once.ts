import { config } from 'dotenv';
import { logger } from '../src/utils/logger';
import { LinkedInScraper } from '../src/services/scraper/linkedin';
import { InternshalaScraper } from '../src/services/scraper/internshala';
import { AIService } from '../src/services/ai/gemini';
import { prisma } from '../src/db/client';
import { exportToCSV } from '../src/utils/csvExporter';

config();

async function runOnce() {
  logger.info('🚀 Starting One-Time Internship Extraction Agent...');

  const searchQueries = [
    { keywords: 'Software Engineering Intern', location: 'Remote' },
    { keywords: 'Full Stack Developer Intern', location: 'Remote' },
    { keywords: 'Frontend Developer Intern', location: 'Remote' }
  ];

  // 1. Run Scrapers
  for (const query of searchQueries) {
    logger.info(`Running LinkedIn Scraper for "${query.keywords}" in "${query.location}"...`);
    const liScraper = new LinkedInScraper();
    await liScraper.searchJobs(query.keywords, query.location);
    await liScraper.close();

    let internshalaKeyword = 'software engineering';
    if (query.keywords.toLowerCase().includes('frontend')) internshalaKeyword = 'front end development';
    if (query.keywords.toLowerCase().includes('full stack')) internshalaKeyword = 'full stack development';

    logger.info(`Running Internshala Scraper for "${internshalaKeyword}"...`);
    const isScraper = new InternshalaScraper();
    await isScraper.searchJobs(internshalaKeyword);
    await isScraper.close();
  }

  // 2. Query New Jobs for Match Evaluation
  logger.info('Checking for newly extracted jobs to evaluate...');
  const newJobs = await prisma.job.findMany({ where: { status: 'NEW' } });
  logger.info(`Found ${newJobs.length} new jobs requiring match evaluation.`);

  const user = await prisma.user.findFirst();
  if (!user) {
    logger.error('No user profile found in DB to match against. Run seed script first.');
    process.exit(1);
  }

  // Evaluate matches sequentially
  for (const job of newJobs) {
    try {
      const matchResult = await AIService.evaluateMatch(
        `Title: ${job.title}\nDescription: ${job.description}`,
        user.rawProfile || user.skills
      );

      let status = 'MATCHED';
      const threshold = parseInt(process.env.MATCH_THRESHOLD || '75', 10);
      if (matchResult.score < threshold) {
        status = 'REJECTED';
      }

      await prisma.job.update({
        where: { id: job.id },
        data: {
          matchScore: matchResult.score,
          matchReasoning: matchResult.reasoning,
          status,
        }
      });

      logger.info(`Evaluated: ${job.title} at ${job.company} -> Score ${matchResult.score} (${status})`);
    } catch (err) {
      logger.error(`Error matching job ${job.title}:`, err);
    }
  }

  // 3. Export all results to CSV
  logger.info('Updating CSV export...');
  await exportToCSV();

  logger.info('✅ One-time extraction and matching run completed successfully. Exiting.');
}

runOnce()
  .catch(err => {
    logger.error('Fatal error during run-once execution:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
