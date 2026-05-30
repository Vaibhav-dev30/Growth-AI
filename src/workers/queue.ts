import { logger } from '../utils/logger';

type JobHandler<T> = (data: T) => Promise<void>;

interface QueueJob<T> {
  id: string;
  data: T;
  retries: number;
}

export class InMemoryQueue<T> {
  private queue: QueueJob<T>[] = [];
  private processing: boolean = false;
  private handler?: JobHandler<T>;

  constructor(private name: string, private maxRetries = 3) {}

  process(handler: JobHandler<T>) {
    this.handler = handler;
    this.startProcessing();
  }

  async add(name: string, data: T) {
    const job: QueueJob<T> = {
      id: `${name}-${Date.now()}`,
      data,
      retries: 0,
    };
    this.queue.push(job);
    logger.info(`[Queue: ${this.name}] Added job: ${job.id}`);
    this.startProcessing();
  }

  private async startProcessing() {
    if (this.processing || !this.handler) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      try {
        logger.info(`[Queue: ${this.name}] Processing job: ${job.id}`);
        await this.handler(job.data);
        logger.info(`[Queue: ${this.name}] Job completed: ${job.id}`);
      } catch (error: any) {
        logger.error(`[Queue: ${this.name}] Job failed: ${job.id}`, error.message);
        if (job.retries < this.maxRetries) {
          job.retries++;
          logger.warn(`[Queue: ${this.name}] Retrying job: ${job.id} (Attempt ${job.retries})`);
          this.queue.push(job);
        } else {
          logger.error(`[Queue: ${this.name}] Job failed permanently: ${job.id}`);
        }
      }
    }

    this.processing = false;
  }
}
