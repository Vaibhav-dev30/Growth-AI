import { prisma } from './client';

const VAIBHAV_PROFILE = {
  name: 'Vaibhav Kumar',
  email: 'vaibhav@email.com',
  linkedinUrl: 'https://linkedin.com/in/vaibhav-kumar-dev',
  githubUrl: 'https://github.com/Vaibhav-dev30',
  portfolioUrl: 'https://portfolio.vercel.app',
  skills: 'JavaScript,Node.js,Python,HTML5,CSS3,Express.js,REST APIs,Git,GitHub,Socket.io,Web Development,Full-Stack Development,Frontend Development,Backend Development,Problem Solving,OOP,Data Structures,Algorithms,Debugging,Software Development',
  education: JSON.stringify([
    {
      institution: 'Inderprastha Engineering College, Delhi',
      degree: 'B.Tech — Computer Science and Engineering',
      duration: '2023 – 2027',
      relevantCourses: 'Data Structures & Algorithms, OOP, DBMS, Web Technologies, Operating Systems'
    }
  ]),
  experience: JSON.stringify([
    {
      title: 'Freelance Web Developer / Independent Developer',
      company: 'Self-Employed / Open Source',
      duration: 'Jan 2024 – Present',
      location: 'Remote',
      bullets: [
        'Built and deployed 3+ full-stack web applications using Node.js, Express.js, HTML/CSS, and JavaScript',
        'Developed Python automation scripts reducing manual task time by ~60%',
        'Maintained active GitHub profile (github.com/Vaibhav-dev30) with consistent daily contributions',
        'Collaborated on open-source projects and implemented REST API integrations'
      ]
    }
  ]),
  projects: JSON.stringify([
    {
      name: 'Personal Portfolio Website',
      description: 'Fully responsive portfolio website showcasing 5+ projects with smooth CSS animations, dark mode, and EmailJS-powered contact form. Achieved Google Lighthouse score 95+.',
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Vercel'],
      githubUrl: 'https://github.com/Vaibhav-dev30',
      liveUrl: ''
    },
    {
      name: 'Full-Stack Task Manager',
      description: 'Full-stack task management web application with RESTful API serving 10+ endpoints for CRUD operations. Implemented JWT authentication and session management. Deployed on Vercel.',
      tech: ['Node.js', 'Express.js', 'JavaScript', 'HTML/CSS'],
      githubUrl: 'https://github.com/Vaibhav-dev30',
      liveUrl: ''
    },
    {
      name: 'Python Automation & Web Scraper',
      description: 'Python web scraping tool using BeautifulSoup and Requests to extract and process structured data. Reduced manual data collection time by ~80%. Implements rate limiting, retry logic, and data export to JSON/CSV.',
      tech: ['Python', 'BeautifulSoup', 'Requests', 'JSON'],
      githubUrl: 'https://github.com/Vaibhav-dev30',
      liveUrl: ''
    }
  ]),
  rawProfile: JSON.stringify({
    summary: 'Passionate Full-Stack Developer and 2nd Year B.Tech Computer Science student at Inderprastha Engineering College, Delhi. Experienced in building scalable web applications using Node.js, Express.js, JavaScript, and Python. Strong understanding of REST APIs, frontend development with HTML5/CSS3, and backend architecture. Actively seeking remote internship opportunities in software engineering to contribute to real-world products and accelerate professional growth.',
    targetRoles: ['Frontend Intern', 'Backend Intern', 'Full-Stack Intern', 'Software Engineer Intern'],
    targetLocations: ['Remote', 'Delhi/NCR', 'Worldwide Remote'],
    openToWork: true,
    college: 'Inderprastha Engineering College (IPEC)',
    year: '2nd Year',
    branch: 'Computer Science Engineering (CSE)'
  })
};

async function seed() {
  console.log('🌱 Seeding user profile into database...');
  try {
    const existingUser = await prisma.user.findFirst({ where: { email: VAIBHAV_PROFILE.email } });

    if (existingUser) {
      // Update existing user with latest profile
      await prisma.user.update({
        where: { id: existingUser.id },
        data: VAIBHAV_PROFILE
      });
      console.log('✅ User profile updated successfully!');
    } else {
      await prisma.user.create({ data: VAIBHAV_PROFILE });
      console.log('✅ User profile created successfully!');
    }

    const user = await prisma.user.findFirst({ where: { email: VAIBHAV_PROFILE.email } });
    console.log(`\n📊 Seeded User: ${user?.name} (ID: ${user?.id})`);
    console.log(`   Skills: ${user?.skills?.split(',').length} skills`);
    console.log(`   Projects: ${JSON.parse(user?.projects || '[]').length} projects`);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
