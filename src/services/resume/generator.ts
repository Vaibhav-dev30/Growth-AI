import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  AlignmentType,
  BorderStyle,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../utils/logger';
import { TailoredResumeData } from '../ai/gemini';

// ── COLOR PALETTE ──────────────────────────────────────────────────────────────
const ACCENT = '7C3AED';      // Purple
const TEXT_DARK = '1E293B';   // Dark slate
const TEXT_MUTED = '64748B';  // Gray
const BORDER_COLOR = 'E2E8F0';

// ── HELPERS ────────────────────────────────────────────────────────────────────
function hr(): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT }
    },
    spacing: { before: 60, after: 80 }
  });
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 18,
        color: ACCENT,
        font: 'Calibri',
      })
    ],
    spacing: { before: 160, after: 40 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR }
    }
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: '▸  ', color: ACCENT, size: 18, font: 'Calibri' }),
      new TextRun({ text, size: 18, color: TEXT_DARK, font: 'Calibri' })
    ],
    indent: { left: 200 },
    spacing: { after: 40 }
  });
}

function skillTag(text: string): TextRun {
  return new TextRun({ text: `${text}  `, size: 16, color: TEXT_DARK, font: 'Calibri' });
}

export class ResumeGenerator {
  static async generateDocx(
    userData: {
      name: string;
      email: string;
      phone?: string;
      linkedinUrl?: string;
      githubUrl?: string;
      portfolioUrl?: string;
    },
    resumeData: TailoredResumeData,
    targetPath: string
  ): Promise<string> {
    try {
      const sections: Paragraph[] = [];

      // ── NAME ──────────────────────────────────────────────────────────────────
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: userData.name,
              bold: true,
              size: 52,
              color: TEXT_DARK,
              font: 'Calibri',
            })
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 40 }
        })
      );

      // ── CONTACT ROW ───────────────────────────────────────────────────────────
      const contactParts: string[] = [];
      if (userData.email) contactParts.push(`✉ ${userData.email}`);
      if (userData.phone) contactParts.push(`✆ ${userData.phone}`);
      if (userData.githubUrl) contactParts.push(`⌥ ${userData.githubUrl.replace('https://', '')}`);
      if (userData.linkedinUrl) contactParts.push(`in ${userData.linkedinUrl.replace('https://', '')}`);
      if (userData.portfolioUrl) contactParts.push(`⊕ ${userData.portfolioUrl.replace('https://', '')}`);
      contactParts.push('📍 Delhi, India (Remote)');

      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join('   |   '),
              size: 16,
              color: TEXT_MUTED,
              font: 'Calibri',
            })
          ],
          spacing: { after: 20 }
        })
      );

      // Accent underline after header
      sections.push(hr());

      // ── PROFESSIONAL SUMMARY ──────────────────────────────────────────────────
      sections.push(sectionTitle('Professional Summary'));
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.summary,
              size: 18,
              color: TEXT_DARK,
              font: 'Calibri',
              italics: false
            })
          ],
          spacing: { after: 60 }
        })
      );

      // ── TECHNICAL SKILLS ──────────────────────────────────────────────────────
      sections.push(sectionTitle('Technical Skills'));

      const skillGroups: Array<{ label: string; skills: string[] }> = [
        { label: 'Languages', skills: resumeData.skills.languages },
        { label: 'Frameworks & Runtime', skills: resumeData.skills.frameworks },
        { label: 'Tools & Platforms', skills: resumeData.skills.tools },
        { label: 'Concepts', skills: resumeData.skills.concepts },
      ];

      for (const group of skillGroups) {
        if (!group.skills || group.skills.length === 0) continue;
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${group.label}: `, bold: true, size: 17, color: TEXT_MUTED, font: 'Calibri' }),
              ...group.skills.map(s => skillTag(s))
            ],
            spacing: { after: 50 }
          })
        );
      }

      // ── PROJECTS ──────────────────────────────────────────────────────────────
      sections.push(sectionTitle('Projects'));

      for (const project of resumeData.projects) {
        // Project name + tech row
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: project.name, bold: true, size: 20, color: TEXT_DARK, font: 'Calibri' }),
              new TextRun({ text: `   ${project.tech}`, size: 17, color: ACCENT, font: 'Calibri' }),
            ],
            spacing: { before: 80, after: 20 }
          })
        );

        // Links row
        const linkParts: string[] = [];
        if (project.githubUrl) linkParts.push(`GitHub: ${project.githubUrl.replace('https://', '')}`);
        if (project.liveUrl) linkParts.push(`Live: ${project.liveUrl.replace('https://', '')}`);
        if (linkParts.length > 0) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: linkParts.join('   |   '), size: 15, color: TEXT_MUTED, font: 'Calibri' })],
              spacing: { after: 20 }
            })
          );
        }

        // Bullet points
        for (const b of project.bullets) {
          sections.push(bullet(b));
        }
      }

      // ── EDUCATION ─────────────────────────────────────────────────────────────
      sections.push(sectionTitle('Education'));
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Inderprastha Engineering College, Delhi', bold: true, size: 20, color: TEXT_DARK, font: 'Calibri' }),
            new TextRun({ text: '     2023 – 2027', size: 17, color: TEXT_MUTED, font: 'Calibri' })
          ],
          spacing: { before: 60, after: 20 }
        })
      );
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: 'B.Tech — Computer Science and Engineering | 2nd Year', size: 18, color: TEXT_MUTED, font: 'Calibri' })],
          spacing: { after: 20 }
        })
      );
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: 'Relevant Coursework: Data Structures & Algorithms, OOP, DBMS, Web Technologies, Operating Systems', size: 16, color: TEXT_MUTED, font: 'Calibri' })],
          spacing: { after: 60 }
        })
      );

      // ── ACHIEVEMENTS ─────────────────────────────────────────────────────────
      sections.push(sectionTitle('Achievements & Activities'));
      for (const ach of resumeData.achievements) {
        sections.push(bullet(ach));
      }

      // ── ATS FOOTER ───────────────────────────────────────────────────────────
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `ATS Keywords Matched: ${resumeData.matchedKeywords.join(', ')}`,
              size: 13,
              color: 'AAAAAA',
              font: 'Calibri',
              italics: true
            })
          ],
          spacing: { before: 160 }
        })
      );

      // ── ASSEMBLE DOCUMENT ─────────────────────────────────────────────────────
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720,
                  bottom: 720,
                  left: 900,
                  right: 900,
                }
              }
            },
            children: sections,
          }
        ],
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 18,
                color: TEXT_DARK
              }
            }
          }
        }
      });

      const buffer = await Packer.toBuffer(doc);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, buffer);

      logger.info(`Generated DOCX resume at ${targetPath}`);
      return targetPath;
    } catch (error: any) {
      logger.error('Failed to generate DOCX resume', error);
      throw error;
    }
  }
}
