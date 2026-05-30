import express, { Request, Response } from 'express';

import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../db/client';
import { logger } from '../utils/logger';
import { AIService } from '../services/ai/gemini';
import { ResumeGenerator } from '../services/resume/generator';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── STATIC FILE SERVING ────────────────────────────────────────────────────────
// Serve the public directory as static files (index.html, resume.html, app.js, style.css, data.js)
const PROJECT_ROOT = path.resolve(__dirname, '../../');
app.use(express.static(path.join(PROJECT_ROOT, 'public'), { index: 'index.html' }));

// ── PROFILE API ────────────────────────────────────────────────────────────────
app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({
        error: 'No user profile found. Please run: npx ts-node src/db/seed.ts'
      });
    }

    // Parse JSON fields safely
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: '',
      linkedinUrl: user.linkedinUrl || '',
      githubUrl: user.githubUrl || 'https://github.com/Vaibhav-dev30',
      portfolioUrl: user.portfolioUrl || '',
      skills: user.skills ? user.skills.split(',').map(s => s.trim()) : [],
      projects: user.projects ? JSON.parse(user.projects) : [],
      education: user.education ? JSON.parse(user.education) : [],
      experience: user.experience ? JSON.parse(user.experience) : [],
    };

    res.json(profile);
  } catch (error) {
    logger.error('Error fetching profile', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── RESUME TAILOR API ──────────────────────────────────────────────────────────
app.post('/api/resume/tailor', async (req: Request, res: Response) => {
  try {
    const { jobDescription, jobTitle, company, projects, personalInfo } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'jobDescription is required' });
    }

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ error: 'At least one project is required' });
    }

    // Get user profile from DB
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({
        error: 'No user profile found. Please run the seed script first.'
      });
    }

    logger.info(`Tailoring resume for: ${jobTitle || 'Unknown Role'} at ${company || 'Unknown Company'}`);

    // Call Gemini to tailor the resume
    const tailoredData = await AIService.tailorResume(
      jobDescription,
      {
        name: personalInfo?.name || user.name,
        email: personalInfo?.email || user.email,
        skills: user.skills,
        rawProfile: user.rawProfile,
      },
      projects
    );

    res.json({
      success: true,
      userData: {
        name: personalInfo?.name || user.name,
        email: personalInfo?.email || user.email,
        phone: personalInfo?.phone || '',
        linkedinUrl: personalInfo?.linkedinUrl || user.linkedinUrl || '',
        githubUrl: personalInfo?.githubUrl || user.githubUrl || 'https://github.com/Vaibhav-dev30',
        portfolioUrl: personalInfo?.portfolioUrl || user.portfolioUrl || '',
      },
      resumeData: tailoredData,
      meta: {
        jobTitle: jobTitle || 'Software Engineer Intern',
        company: company || 'Unknown Company',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error tailoring resume', error);
    res.status(500).json({ error: 'Failed to tailor resume: ' + error.message });
  }
});

// ── DOCX DOWNLOAD API ──────────────────────────────────────────────────────────
app.post('/api/resume/download-docx', async (req: Request, res: Response) => {
  try {
    const { userData, resumeData, meta } = req.body;

    if (!userData || !resumeData) {
      return res.status(400).json({ error: 'userData and resumeData are required' });
    }

    // Generate a safe filename
    const safeCompany = (meta?.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const safeRole = (meta?.jobTitle || 'Intern').replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Vaibhav_Kumar_${safeRole}_${safeCompany}_${timestamp}.docx`;

    // Generate DOCX in a temp directory
    const outputDir = path.join(PROJECT_ROOT, 'generated-resumes');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, filename);

    await ResumeGenerator.generateDocx(userData, resumeData, outputPath);

    // Stream the file back to the client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-ATS-Score', resumeData.atsScore?.toString() || '0');

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      logger.info(`DOCX resume downloaded: ${filename}`);
      // Clean up file after a delay
      setTimeout(() => {
        try { fs.unlinkSync(outputPath); } catch {}
      }, 10000);
    });

    fileStream.on('error', (err) => {
      logger.error('Error streaming DOCX', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream DOCX file' });
      }
    });
  } catch (error: any) {
    logger.error('Error generating DOCX', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate DOCX: ' + error.message });
    }
  }
});

// ── JOB APIS ──────────────────────────────────────────────────────────────────
app.get('/api/jobs/matched', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'MATCHED' },
      orderBy: { matchScore: 'desc' },
    });
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching matched jobs', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/all', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching all jobs', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'READY_TO_APPLY' },
    });
    logger.info(`Job ${id} approved for application`);
    res.json(job);
  } catch (error) {
    logger.error('Error approving job', error);
    res.status(500).json({ error: 'Failed to approve job' });
  }
});

app.post('/api/jobs/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const job = await prisma.job.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    res.json(job);
  } catch (error) {
    logger.error('Error rejecting job', error);
    res.status(500).json({ error: 'Failed to reject job' });
  }
});

app.post('/api/jobs/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { status } = req.body;
    const job = await prisma.job.update({
      where: { id },
      data: { status },
    });
    logger.info(`Job ${id} status updated to: ${status}`);
    res.json(job);
  } catch (error) {
    logger.error('Error updating job status', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});


app.get('/api/applications', async (req: Request, res: Response) => {
  try {
    const apps = await prisma.application.findMany({
      include: { job: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(apps);
  } catch (error) {
    logger.error('Error fetching applications', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ── SERVER START ───────────────────────────────────────────────────────────────
export const startServer = (port = 3000) => {
  app.listen(port, () => {
    logger.info(`🚀 CareerAI Dashboard running at http://localhost:${port}`);
    logger.info(`📄 Resume Builder at http://localhost:${port}/resume.html`);
    logger.info(`🔌 API Base: http://localhost:${port}/api`);
  });
};
