// @ts-ignore — playwright is installed at runtime, types may not be declared
import { chromium, Browser, Page } from 'playwright';

import { logger } from '../../utils/logger';
import { prisma } from '../../db/client';

export class LinkedInScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS_MODE === 'true' });
    this.page = await this.browser.newPage();
  }

  async searchJobs(keywords: string, location: string) {
    if (!this.page) await this.init();
    logger.info(`Searching LinkedIn jobs for ${keywords} in ${location}`);
    
    try {
      // f_E=1 means Internship in LinkedIn search filters
      const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&f_E=1`;
      await this.page!.goto(searchUrl, { waitUntil: 'domcontentloaded' });

      // In a real implementation, we would scroll and extract job cards.
      // This is a basic extraction stub.
      const jobs = await this.page!.$$eval('.base-card', (cards: any) => {
        return cards.map((card: any) => {

          const title = card.querySelector('.base-search-card__title')?.textContent?.trim() || '';
          const company = card.querySelector('.base-search-card__subtitle')?.textContent?.trim() || '';
          const url = (card.querySelector('.base-card__full-link') as HTMLAnchorElement)?.href || '';
          const location = card.querySelector('.job-search-card__location')?.textContent?.trim() || '';
          
          return { title, company, url, location };
        });
      });

      logger.info(`Found ${jobs.length} jobs on LinkedIn`);

      for (const job of jobs) {
        if (!job.url) continue;

        const existingJob = await prisma.job.findUnique({ where: { url: job.url } });
        if (existingJob) continue;

        await prisma.job.create({
          data: {
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            source: 'linkedin',
            description: 'Description not loaded yet', // We would normally visit the URL to get the full description
            isRemote: job.location.toLowerCase().includes('remote'),
          }
        });
      }
    } catch (error: any) {
      logger.error('LinkedIn Scraper Error', error);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
