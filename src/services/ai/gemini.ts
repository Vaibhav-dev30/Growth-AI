import { GoogleGenAI, Type, Schema } from '@google/genai';
import { config } from 'dotenv';
import { logger } from '../../utils/logger';

config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

export interface MatchResult {
  score: number;
  reasoning: string;
  missingSkills: string[];
}

export interface TailoredResumeData {
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    concepts: string[];
  };
  projects: Array<{
    name: string;
    tech: string;
    liveUrl: string;
    githubUrl: string;
    bullets: string[];
  }>;
  achievements: string[];
  atsScore: number;
  matchedKeywords: string[];
}

export class AIService {
  static evaluateMatchFallback(jobDescription: string, userProfileStr: string): MatchResult {
    let skills: string[] = [];
    try {
      if (userProfileStr.trim().startsWith('{')) {
        const parsed = JSON.parse(userProfileStr);
        if (parsed.skills) {
          if (Array.isArray(parsed.skills)) {
            skills = parsed.skills;
          } else if (typeof parsed.skills === 'string') {
            skills = parsed.skills.split(',').map((s: string) => s.trim());
          }
        }
      }
    } catch (e) {}

    if (skills.length === 0) {
      skills = userProfileStr.split(',').map(s => s.trim()).filter(Boolean);
    }

    const descLower = jobDescription.toLowerCase();
    const userSkillsLower = skills.map(s => s.toLowerCase());

    const matchedCategories: string[] = [];
    const matchedSkills: string[] = [];

    // Define category mappings for smart synonyms matching
    const categories = [
      {
        name: 'Frontend / Web Development',
        jobKeywords: ['frontend', 'front end', 'react', 'angular', 'vue', 'html', 'css', 'javascript', 'web', 'ui', 'ux', 'tailwind', 'bootstrap', 'responsive'],
        userKeywords: ['javascript', 'html', 'css', 'react', 'web development', 'frontend development', 'software development']
      },
      {
        name: 'Backend / Database',
        jobKeywords: ['backend', 'back end', 'node', 'express', 'django', 'flask', 'python', 'api', 'rest', 'graphql', 'mongodb', 'sql', 'mysql', 'postgres', 'database', 'server'],
        userKeywords: ['node', 'python', 'express', 'api', 'mongodb', 'backend development', 'software development']
      },
      {
        name: 'Software Engineering / Core CS',
        jobKeywords: ['software engineer', 'sde', 'developer', 'programmer', 'coding', 'intern', 'fresher', 'development', 'engineer', 'trainee'],
        userKeywords: ['problem solving', 'oop', 'data structures', 'algorithms', 'debugging', 'software development']
      }
    ];

    let score = 55; // Base score

    categories.forEach(cat => {
      const hasJobKeyword = cat.jobKeywords.some(kw => descLower.includes(kw));
      const hasUserSkill = cat.userKeywords.some(ukw => 
        userSkillsLower.some(us => us.includes(ukw))
      );

      if (hasJobKeyword && hasUserSkill) {
        matchedCategories.push(cat.name);
        score += 12; // Add 12 points per matching category
        
        // Find which user skills triggered this match to report them
        skills.forEach(skill => {
          const sLower = skill.toLowerCase();
          cat.userKeywords.forEach(ukw => {
            if (sLower.includes(ukw) && !matchedSkills.includes(skill)) {
              matchedSkills.push(skill);
            }
          });
        });
      }
    });

    // Exact skill mentions in description/title
    skills.forEach(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(descLower) || descLower.includes(skill.toLowerCase())) {
        if (!matchedSkills.includes(skill)) {
          matchedSkills.push(skill);
        }
        score += 3; // Boost score for exact skill word matches
      }
    });

    // Internship / Fresher boost
    if (descLower.includes('intern') || descLower.includes('fresher') || descLower.includes('trainee')) {
      score += 8;
    }

    score = Math.min(100, Math.max(0, score));
    const missingSkills = skills.filter(s => !matchedSkills.includes(s));

    return {
      score,
      reasoning: `Heuristic fallback match. Matched Categories: ${matchedCategories.join(', ')}. Key matched skills: ${matchedSkills.slice(0, 5).join(', ')}.`,
      missingSkills
    };
  }

  static async evaluateMatch(jobDescription: string, userProfile: string): Promise<MatchResult> {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
        logger.warn('Using local heuristic matching logic due to missing Gemini API Key.');
        return AIService.evaluateMatchFallback(jobDescription, userProfile);
      }

      const prompt = `
      You are an expert ATS (Applicant Tracking System).
      Evaluate the match between the following Job Description and the User Profile.
      
      Job Description:
      ${jobDescription}
      
      User Profile:
      ${userProfile}
      `;
      
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          score: {
            type: Type.INTEGER,
            description: "A number from 0 to 100 representing the match score."
          },
          reasoning: {
            type: Type.STRING,
            description: "A short string explaining the score."
          },
          missingSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "Key skills missing from profile."
          }
        },
        required: ["score", "reasoning", "missingSkills"],
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      if (!response.text) {
          throw new Error('No text returned from Gemini API');
      }

      const result = JSON.parse(response.text);
      return result as MatchResult;
    } catch (error: any) {
      logger.error('Error evaluating match with Gemini, falling back to local matching', error);
      try {
        return AIService.evaluateMatchFallback(jobDescription, userProfile);
      } catch (fallbackError) {
        logger.error('Error in heuristic fallback matching', fallbackError);
        return { score: 75, reasoning: 'Default fallback match due to evaluation error', missingSkills: [] };
      }
    }
  }

  static async tailorResume(
    jobDescription: string,
    userProfile: any,
    userProjects: Array<{ name: string; description: string; tech: string[]; liveUrl: string; githubUrl: string }>
  ): Promise<TailoredResumeData> {
    try {
      const hasKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key';
      
      if (!hasKey) {
        logger.warn('Using fallback resume data (no Gemini API key configured).');
        return AIService._fallbackResume(userProfile, userProjects);
      }

      const baseSkills = userProfile.skills || '';
      const projectsText = userProjects.map(p =>
        `- ${p.name}: ${p.description} (Tech: ${p.tech.join(', ')}) [Live: ${p.liveUrl || 'N/A'}, GitHub: ${p.githubUrl || 'N/A'}]`
      ).join('\n');

      const prompt = `
You are an expert ATS resume writer and career coach. Your job is to tailor a resume for a specific job description.

**CANDIDATE PROFILE:**
Name: ${userProfile.name}
College: Inderprastha Engineering College (IPEC), Delhi — 2nd Year B.Tech CSE (2023–2027)
Skills: ${baseSkills}

**CANDIDATE PROJECTS:**
${projectsText}

**TARGET JOB DESCRIPTION:**
${jobDescription}

**YOUR TASK:**
Generate a highly ATS-optimized, tailored resume JSON. Rules:
1. Extract the top keywords/skills from the JD and weave them naturally into the summary and project bullets.
2. Rewrite project bullets using the XYZ formula: "Accomplished [X], measured by [Y], by doing [Z]".
3. Each project must have exactly 3-4 strong, quantified bullet points.
4. The professional summary must be 2-3 sentences, laser-focused on the JD requirements. Do NOT use "I" — write in 3rd person.
5. Organize skills into 4 categories: languages, frameworks, tools, concepts.
6. Only include skills that are genuinely part of the candidate's profile or closely related.
7. List 3-4 professional achievements.
8. Calculate an honest ATS match score (0-100) based on keyword alignment.
9. Return a list of matched keywords from the JD that appear in the resume.

Output strict JSON only — no markdown, no extra text.
`;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Tailored professional summary (2-3 sentences, 3rd person, ATS-optimized)" },
          skills: {
            type: Type.OBJECT,
            properties: {
              languages: { type: Type.ARRAY, items: { type: Type.STRING } },
              frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
              tools: { type: Type.ARRAY, items: { type: Type.STRING } },
              concepts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['languages', 'frameworks', 'tools', 'concepts']
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                tech: { type: Type.STRING, description: "Tech stack as a pipe-separated string e.g. Node.js | Express.js | JavaScript" },
                liveUrl: { type: Type.STRING },
                githubUrl: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 XYZ-formula bullets" }
              },
              required: ['name', 'tech', 'liveUrl', 'githubUrl', 'bullets']
            }
          },
          achievements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 professional achievements" },
          atsScore: { type: Type.INTEGER, description: "ATS match score 0-100" },
          matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "JD keywords matched in resume" }
        },
        required: ['summary', 'skills', 'projects', 'achievements', 'atsScore', 'matchedKeywords']
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      if (!response.text) throw new Error('No text returned from Gemini API');

      const result = JSON.parse(response.text);
      logger.info(`Resume tailored successfully. ATS Score: ${result.atsScore}`);
      return result as TailoredResumeData;
    } catch (error: any) {
      logger.error('Error tailoring resume with Gemini', error);
      return AIService._fallbackResume(userProfile, userProjects);
    }
  }

  private static _fallbackResume(userProfile: any, userProjects: any[]): TailoredResumeData {
    return {
      summary: `Passionate Full-Stack Developer and 2nd Year B.Tech CSE student at Inderprastha Engineering College, Delhi. Experienced in building scalable web applications using Node.js, Express.js, JavaScript, and Python. Actively seeking remote internship opportunities to contribute to real-world software products.`,
      skills: {
        languages: ['JavaScript (ES6+)', 'Python 3', 'HTML5', 'CSS3'],
        frameworks: ['Node.js', 'Express.js', 'REST APIs', 'Socket.io'],
        tools: ['Git & GitHub', 'VS Code', 'Postman', 'Vercel'],
        concepts: ['Full-Stack Development', 'OOP', 'CRUD Operations', 'Responsive Design']
      },
      projects: userProjects.map(p => ({
        name: p.name,
        tech: p.tech.join(' | '),
        liveUrl: p.liveUrl || '',
        githubUrl: p.githubUrl || 'https://github.com/Vaibhav-dev30',
        bullets: [
          `Designed and developed ${p.name} solving real-world problems using ${p.tech.slice(0, 2).join(' and ')}`,
          `Implemented core features including authentication, CRUD operations, and API integration`,
          `Deployed on Vercel with CI/CD integration maintaining high uptime and fast response times`,
        ]
      })),
      achievements: [
        'Active open-source contributor with consistent daily GitHub contributions (github.com/Vaibhav-dev30)',
        'Completed JavaScript Algorithms & Data Structures certification — freeCodeCamp (300+ hours)',
        'Built and deployed 3+ full-stack web applications as self-directed projects',
        'Self-taught full-stack development through project-based learning'
      ],
      atsScore: 75,
      matchedKeywords: ['JavaScript', 'Node.js', 'Python', 'REST APIs', 'Full-Stack']
    };
  }

  static async generateCoverLetter(jobTitle: string, company: string, userProfile: string): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
        return `Dear Hiring Manager at ${company},\n\nI am writing to apply for the ${jobTitle} position...`;
      }

      const prompt = `
      Write a professional, concise cover letter for the position of ${jobTitle} at ${company} based on this profile:
      ${userProfile}
      Keep it under 3 paragraphs. Do not invent experience.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text || '';
    } catch (error: any) {
      logger.error('Error generating cover letter with Gemini', error);
      return 'Error generating cover letter.';
    }
  }
}
