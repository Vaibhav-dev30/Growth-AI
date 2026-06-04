import { prisma } from '../db/client';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  str = str.replace(/"/g, '""');
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str}"`;
  }
  return str;
}

export async function exportToCSV() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Title',
      'Company',
      'Location',
      'URL',
      'Source',
      'Is Remote',
      'Is Internship',
      'Salary / Stipend',
      'Match Score',
      'Match Reasoning',
      'Status',
      'Date Found'
    ];

    const rows = [headers.join(',')];

    for (const job of jobs) {
      const row = [
        escapeCSV(job.title),
        escapeCSV(job.company),
        escapeCSV(job.location),
        escapeCSV(job.url),
        escapeCSV(job.source),
        escapeCSV(job.isRemote ? 'Yes' : 'No'),
        escapeCSV(job.isInternship ? 'Yes' : 'No'),
        escapeCSV(job.salary),
        escapeCSV(job.matchScore !== null ? job.matchScore : 'N/A'),
        escapeCSV(job.matchReasoning),
        escapeCSV(job.status),
        escapeCSV(job.createdAt.toISOString())
      ];
      rows.push(row.join(','));
    }

    const csvContent = rows.join('\n');
    const outputPath = path.join(process.cwd(), 'internships.csv');
    
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    logger.info(`Successfully updated CSV export at ${outputPath} (Total: ${jobs.length} jobs)`);
  } catch (error) {
    logger.error('Error exporting database to CSV', error);
  }
}
