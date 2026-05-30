// @ts-ignore — playwright is installed at runtime, types may not be declared
import { chromium, Browser, Page } from 'playwright';

import { logger } from '../../utils/logger';
import { prisma } from '../../db/client';

export class InternshalaScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS_MODE === 'true' });
    this.page = await this.browser.newPage();
    // Internshala sometimes blocks if no user-agent is provided
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }

  async searchJobs(keyword: string) {
    if (!this.page) await this.init();
    logger.info(`Searching Internshala for ${keyword}`);
    
    try {
      // Format the keyword for Internshala URL (e.g. "software engineering" -> "software-engineering")
      const formattedKeyword = keyword.toLowerCase().replace(/\s+/g, '-');
      // Always appending work-from-home since you prefer remote
      const searchUrl = `https://internshala.com/internships/work-from-home-${formattedKeyword}-internships/`;
      
      const response = await this.page!.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      if (response?.status() === 404) {
        logger.warn(`Internshala returned 404 for ${searchUrl}. The keyword might not be a valid category.`);
        return;
      }

      const jobs = await this.page!.$$eval('.internship_meta', (cards: any) => {
        return cards.map((card: any) => {

          const title = card.querySelector('.profile a')?.textContent?.trim() || '';
          const company = card.querySelector('.company_name a')?.textContent?.trim() || '';
          const relativeUrl = (card.querySelector('.profile a') as HTMLAnchorElement)?.getAttribute('href') || '';
          const url = relativeUrl ? `https://internshala.com${relativeUrl}` : '';
          
          // Internshala has specific layout for stipend
          const stipend = card.querySelector('.stipend')?.textContent?.trim() || 'Unpaid/Not specified';
          
          return { title, company, url, stipend };
        });
      });

      logger.info(`Found ${jobs.length} internships on Internshala`);

      for (const job of jobs) {
        if (!job.url) continue;

        const existingJob = await prisma.job.findUnique({ where: { url: job.url } });
        if (existingJob) continue;

        await prisma.job.create({
          data: {
            title: job.title,
            company: job.company,
            location: 'Remote',
            url: job.url,
            source: 'internshala',
            description: `Stipend: ${job.stipend}\n(Full description not loaded to save time)`, 
            isRemote: true,
            isInternship: true,
            salary: job.stipend,
          }
        });
      }
    } catch (error: any) {
      logger.error('Internshala Scraper Error', error);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
