import { config } from 'dotenv';
import { logger } from './utils/logger';
import { startServer } from './api/server';
import { InMemoryQueue } from './workers/queue';
import { LinkedInScraper } from './services/scraper/linkedin';
import { InternshalaScraper } from './services/scraper/internshala';
import { AIService } from './services/ai/gemini';
import { prisma } from './db/client';

config();

async function bootstrap() {
  logger.info('Starting Autonomous Job Application Agent...');

  // Start the API dashboard
  startServer(3000);

  // Initialize queues
  const scraperQueue = new InMemoryQueue<{ keywords: string; location: string }>('ScraperQueue');
  const matcherQueue = new InMemoryQueue<{ jobId: string }>('MatcherQueue');

  // Define Job Matcher Worker
  matcherQueue.process(async ({ jobId }) => {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;

    // Fetch user profile
    const user = await prisma.user.findFirst();
    if (!user) {
      logger.warn('No user profile found in DB to match against. Run a setup script first.');
      return;
    }

    const matchResult = await AIService.evaluateMatch(`Title: ${job.title}\nDescription: ${job.description}`, user.rawProfile || user.skills);
    
    let status = 'MATCHED';
    const threshold = parseInt(process.env.MATCH_THRESHOLD || '75', 10);
    
    if (matchResult.score < threshold) {
      status = 'REJECTED';
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        matchScore: matchResult.score,
        matchReasoning: matchResult.reasoning,
        status,
      }
    });
    
    logger.info(`Evaluated job ${job.title} at ${job.company}: Score ${matchResult.score} -> ${status}`);
  });

  // Define Scraper Worker
  scraperQueue.process(async ({ keywords, location }) => {
    // 1. Scrape LinkedIn
    const liScraper = new LinkedInScraper();
    await liScraper.searchJobs(keywords, location);
    await liScraper.close();

    // 2. Scrape Internshala
    // Internshala is better with shorter keywords, so we map them
    let internshalaKeyword = 'software engineering';
    if (keywords.toLowerCase().includes('frontend')) internshalaKeyword = 'front end development';
    if (keywords.toLowerCase().includes('full stack')) internshalaKeyword = 'full stack development';
    
    const isScraper = new InternshalaScraper();
    await isScraper.searchJobs(internshalaKeyword);
    await isScraper.close();

    // Find new jobs and queue them for matching
    const newJobs = await prisma.job.findMany({ where: { status: 'NEW' } });
    for (const job of newJobs) {
      matcherQueue.add('match', { jobId: job.id });
    }
  });

  // Schedule a daily run (using setTimeout for simplicity in this local context)
  const runDailyScrape = () => {
    logger.info('Triggering scheduled internship scrape...');
    scraperQueue.add('scrape', { keywords: 'Software Engineering Intern', location: 'Remote' });
    scraperQueue.add('scrape', { keywords: 'Full Stack Developer Intern', location: 'Remote' });
    scraperQueue.add('scrape', { keywords: 'Frontend Developer Intern', location: 'Remote' });
  };

  // Run once on startup
  runDailyScrape();

  // Then run every 24 hours
  setInterval(runDailyScrape, 24 * 60 * 60 * 1000);

  logger.info('System fully initialized and running.');
}

bootstrap().catch(err => {
  logger.error('Fatal error during bootstrap', err);
  process.exit(1);
});
