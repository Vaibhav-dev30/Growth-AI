
const PROFILE = {
  name: "Vaibhav Kumar", github: "Vaibhav-dev30",
  college: "Inderprastha Engineering College (IPEC)", year: "2nd Year",
  branch: "Computer Science Engineering",
  skills: ["Node.js", "HTML5", "CSS3", "JavaScript", "Python"],
  targetRoles: ["Frontend Intern", "Backend Intern", "Full-Stack Intern"],
  jobType: "Remote Internship", avatar: "VK"
};

const LINKEDIN_OPTIMIZER = {
  profileScore: 62, atsScore: 58, seoScore: 55,
  currentHeadline: "Engineering Student | CSE | Inderprastha Engineering College",
  optimizedHeadlines: [
    "Full-Stack Developer | Node.js • JavaScript • Python | CSE @ IPEC | Open to Remote Internships 🚀",
    "Aspiring SDE | Full-Stack Web Dev | Node.js | Python | 2nd Year CSE | Remote Intern Ready",
    "Frontend + Backend Developer | JavaScript | Node.js | Python | Building Real Projects | Open to Internships"
  ],
  aboutSection: `🚀 Hey! I'm Vaibhav Kumar — a passionate Full-Stack Developer and 2nd Year Computer Science student at Inderprastha Engineering College, Delhi.

I build real-world web applications that solve actual problems — from responsive frontends with HTML/CSS/JavaScript to powerful backends with Node.js and Python.

💻 What I build:
• Full-Stack Web Applications (Node.js + Express + JavaScript)
• Interactive Frontend Interfaces (HTML5, CSS3, Vanilla JS)
• Python Automation Scripts & Backend APIs
• REST APIs and Database-driven applications

🔥 Currently focused on:
• Building production-grade projects for my GitHub (@Vaibhav-dev30)
• Learning React.js and cloud deployment (Vercel/AWS)
• Preparing for remote internship opportunities

🎯 What I'm looking for:
Remote internships in Frontend, Backend, or Full-Stack development where I can contribute, grow fast, and build impactful software.

📌 Open to: Remote Internships | SDE Intern | Web Dev Projects | Freelance
💬 Let's connect if you're hiring interns or building something cool!

#OpenToWork #FullStack #NodeJS #JavaScript #Python #RemoteIntern`,
  keywords: [
    "Full Stack Developer","Frontend Developer","Backend Developer","Node.js",
    "JavaScript","Python","Express.js","REST API","Web Development",
    "Software Engineer Intern","Remote Internship","Open To Work","SDE Intern",
    "React.js","MERN Stack","HTML CSS"
  ],
  skillsToAdd: [
    { skill: "React.js", priority: "HIGH", reason: "Most demanded frontend framework" },
    { skill: "Express.js", priority: "HIGH", reason: "Completes Node.js backend stack" },
    { skill: "MongoDB", priority: "HIGH", reason: "Popular NoSQL DB for MERN stack" },
    { skill: "Git & GitHub", priority: "HIGH", reason: "Essential for any dev role" },
    { skill: "REST APIs", priority: "MEDIUM", reason: "Core backend skill" },
    { skill: "TypeScript", priority: "MEDIUM", reason: "Increasingly required" },
    { skill: "SQL/PostgreSQL", priority: "MEDIUM", reason: "Relational DB knowledge needed" },
    { skill: "Docker", priority: "LOW", reason: "DevOps awareness is a plus" }
  ],
  checklist: [
    { item: "Professional headshot photo", done: false, impact: "HIGH" },
    { item: "Custom LinkedIn banner (1584x396px)", done: false, impact: "HIGH" },
    { item: "Optimized headline with keywords", done: false, impact: "HIGH" },
    { item: "Compelling About section (500+ chars)", done: false, impact: "HIGH" },
    { item: "Featured section (top project/GitHub)", done: false, impact: "HIGH" },
    { item: "Education filled in completely", done: true, impact: "MEDIUM" },
    { item: "Skills section (20+ skills added)", done: false, impact: "HIGH" },
    { item: "Projects listed with descriptions", done: false, impact: "HIGH" },
    { item: "Open to Work banner enabled", done: false, impact: "HIGH" },
    { item: "Custom LinkedIn URL set", done: false, impact: "MEDIUM" },
    { item: "3+ recommendations requested", done: false, impact: "MEDIUM" },
    { item: "Contact info filled (email, GitHub)", done: false, impact: "HIGH" }
  ]
};

const GITHUB_ANALYZER = {
  username: "Vaibhav-dev30",
  projectSuggestions: [
    { name: "AI Chatbot", description: "Python + OpenAI API chatbot with web interface", reason: "AI is #1 trending skill — instantly boosts profile value", priority: "🔥 MUST BUILD", tech: ["Python","OpenAI API","Flask","JavaScript"], estimatedTime: "3-5 days" },
    { name: "Portfolio Website", description: "Personal portfolio with projects, skills, contact form", reason: "First thing recruiters click — must be impressive", priority: "🔥 MUST BUILD", tech: ["HTML","CSS","JavaScript","EmailJS"], estimatedTime: "2-3 days" },
    { name: "Full-Stack Task Manager", description: "Node.js backend + MongoDB + frontend CRUD app", reason: "Shows complete stack proficiency (MERN/MEAN)", priority: "⭐ HIGH", tech: ["Node.js","MongoDB","Express","JavaScript"], estimatedTime: "5-7 days" },
    { name: "Real-Time Chat App", description: "Socket.io + Node.js real-time messaging application", reason: "Demonstrates advanced Node.js knowledge", priority: "⭐ HIGH", tech: ["Node.js","Socket.io","JavaScript","CSS"], estimatedTime: "4-6 days" },
    { name: "URL Shortener + Analytics", description: "Full-stack URL shortener with click analytics dashboard", reason: "Unique project showing backend + DB skills", priority: "⭐ HIGH", tech: ["Node.js","MongoDB","Express","Chart.js"], estimatedTime: "4-5 days" },
    { name: "Python Web Scraper Dashboard", description: "Scraper using BeautifulSoup + data visualization", reason: "Shows Python + data skills relevant to AI/ML roles", priority: "🟡 MEDIUM", tech: ["Python","BeautifulSoup","Pandas","Matplotlib"], estimatedTime: "3-4 days" }
  ]
};

const JOB_LISTINGS = [
  { company: "Internshala Startup", role: "Frontend Developer Intern", type: "Remote Internship", location: "Remote", salary: "₹5,000–₹15,000/mo", skills: ["HTML","CSS","JavaScript"], match: 92, link: "https://internshala.com/internships/work-from-home-web-development-internship", urgent: true, posted: "2 days ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "Razorpay", role: "Software Development Intern", type: "Remote Internship", location: "Remote", salary: "₹25,000–₹40,000/mo", skills: ["Node.js","JavaScript","REST API"], match: 78, link: "https://razorpay.com/jobs", urgent: false, posted: "5 days ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "Tata 1mg", role: "Full Stack Intern", type: "Remote Internship", location: "Remote", salary: "₹15,000–₹25,000/mo", skills: ["Node.js","React","MongoDB"], match: 71, link: "https://www.1mg.com/careers", urgent: false, posted: "1 week ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "WatchGuard Tech", role: "Web Developer Intern", type: "Remote Internship", location: "Remote", salary: "₹10,000/mo", skills: ["HTML","CSS","JavaScript"], match: 88, link: "https://wellfound.com", urgent: true, posted: "3 days ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "Ola", role: "Backend Developer Intern", type: "Remote Internship", location: "Remote", salary: "₹20,000–₹35,000/mo", skills: ["Node.js","Python","APIs"], match: 82, link: "https://ola.com/careers", urgent: false, posted: "4 days ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "Groww", role: "Frontend Intern", type: "Remote Internship", location: "Remote", salary: "₹15,000–₹30,000/mo", skills: ["JavaScript","HTML","CSS","React"], match: 75, link: "https://groww.in/careers", urgent: false, posted: "1 week ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "YC Startup (Remote)", role: "Full Stack Developer Intern", type: "Remote Internship", location: "Remote (Global)", salary: "$800–$1,200/mo", skills: ["Node.js","JavaScript","Python"], match: 69, link: "https://www.workatastartup.com", urgent: false, posted: "3 days ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" },
  { company: "RemoteOK Startup", role: "Junior JavaScript Developer", type: "Remote", location: "Worldwide Remote", salary: "$500–$1,000/mo", skills: ["JavaScript","Node.js","CSS"], match: 74, link: "https://remoteok.com", urgent: false, posted: "6 days ago", status: "Not Applied", followUp: "", notes: "", recruiter: "", recruiterLinkedIn: "" }
];

const POST_TEMPLATES = {
  tech: [
    { hook: "💡 I just learned something about JavaScript that blew my mind...", body: `Most developers don't know this JS trick that can save 10 lines of code every time.

Here's what I discovered while building my latest project:

✅ Use optional chaining (?.) to avoid "cannot read property of undefined" errors
✅ Use nullish coalescing (??) instead of || for safer defaults
✅ Use Promise.all() to run async tasks in parallel

These 3 patterns changed how I write JavaScript forever.

Are you using these in your projects? Drop a 👇 below!

github.com/Vaibhav-dev30`, hashtags: "#JavaScript #WebDev #CodingTips #LearnToCode #100DaysOfCode #NodeJS" },
    { hook: "🐍 Python vs Node.js — I finally have an opinion after using both...", body: `I've been building with both Python and Node.js as a 2nd year CSE student.

My honest take:

Python wins for: Data processing, automation, AI/ML scripts
Node.js wins for: Real-time apps, REST APIs, full-stack JS

The truth? Learn BOTH. In 2025, the best developers are polyglot.

What's your go-to language? Comment below! 👇

Building daily → github.com/Vaibhav-dev30`, hashtags: "#Python #NodeJS #WebDevelopment #SoftwareEngineering #TechStudent #Coding" }
  ],
  project: [
    { hook: "🚀 Just shipped a new project — here's what I built and what I learned...", body: `[Project Name] is live! 🎉

🔨 What I built: [Short description]
⚡ Tech stack: Node.js | JavaScript | CSS | Python
🎯 Problem it solves: [One line]
😤 Biggest challenge: [Brief]
💡 Key learning: [Insight]

GitHub: github.com/Vaibhav-dev30
Live demo: [Link]

Building in public and loving every second 🔥
Drop a ⭐ if you found it useful!`, hashtags: "#BuildInPublic #WebDev #NodeJS #JavaScript #StudentDeveloper #OpenSource" }
  ],
  internship: [
    { hook: "📢 Open to Remote Internships — here's why you should hire me (or refer me)...", body: `Hey LinkedIn! 👋

I'm Vaibhav Kumar — 2nd Year CSE @ Inderprastha Engineering College, Delhi.

Actively seeking remote internships in:
✅ Frontend Development
✅ Backend Development
✅ Full-Stack Engineering

What I bring:
🔷 Node.js + Express backend APIs
🔷 Clean, responsive HTML/CSS/JS frontends
🔷 Python scripting and automation
🔷 Active GitHub: github.com/Vaibhav-dev30
🔷 Fast learner who ships code

📌 Available: Immediately | Remote | Flexible duration

If you're building something cool and need a hungry intern — let's talk! 💬
Please tag anyone hiring interns or refer me! 🙏`, hashtags: "#OpenToWork #InternshipSearch #RemoteInternship #SoftwareEngineer #CSEStudent #WebDev" }
  ],
  ai_trend: [
    { hook: "🤖 AI is NOT going to replace developers. But here's what WILL happen...", body: `Hot take: AI won't replace software engineers.
It will replace engineers who DON'T use AI.

As a CS student in 2025, I use AI tools daily:
🔷 GitHub Copilot → Write boilerplate 10x faster
🔷 ChatGPT → Debug complex errors instantly
🔷 Claude → Review and improve code quality
🔷 v0.dev → Prototype UI in minutes

The developers who thrive will be those who learn to "speak AI" — prompting, integrating, and building WITH these tools.

I'm actively learning to build AI-powered apps alongside my core stack.

Are you adapting? What AI tools are in your dev toolkit? 👇`, hashtags: "#AI #ArtificialIntelligence #WebDev #FutureOfWork #TechTrends #StudentDeveloper" }
  ],
  personal: [
    { hook: "📖 6 months into my coding journey — here's what nobody tells you...", body: `Honest reflection as a 2nd year CSE student:

Nobody tells you that coding is 80% Googling, Stack Overflow, and documentation reading.

What actually helped me grow:
1️⃣ Building real projects (not just tutorials)
2️⃣ GitHub daily commits habit
3️⃣ Writing about what I learn on LinkedIn
4️⃣ Reading other people's code
5️⃣ Breaking things and fixing them

The biggest lie: "You need to know everything before you start building."

You don't. Build first. Learn as you go.

Currently building → github.com/Vaibhav-dev30
What's your #1 coding lesson? Share below! 👇`, hashtags: "#CodingJourney #StudentDeveloper #WebDev #LearningInPublic #CSE #SoftwareEngineering" }
  ]
};

const ROADMAP_30_DAYS = [
  { week: 1, title: "Profile Foundation", days: [
    { day: 1, task: "Set optimized LinkedIn headline (use template from optimizer)", priority: "🔥", done: false },
    { day: 2, task: "Write and publish new About section (use generator)", priority: "🔥", done: false },
    { day: 3, task: "Add 20+ skills to LinkedIn Skills section", priority: "🔥", done: false },
    { day: 4, task: "Enable 'Open to Work' badge with intern roles selected", priority: "🔥", done: false },
    { day: 5, task: "Add all projects to LinkedIn with proper descriptions", priority: "⭐", done: false },
    { day: 6, task: "Design LinkedIn banner on Canva (Tech/Dev template)", priority: "⭐", done: false },
    { day: 7, task: "Send 10 connection requests to seniors/developers", priority: "⭐", done: false }
  ]},
  { week: 2, title: "GitHub Overhaul", days: [
    { day: 8, task: "Update all README files with screenshots + tech stack", priority: "🔥", done: false },
    { day: 9, task: "Pin 6 best repositories on GitHub profile", priority: "⭐", done: false },
    { day: 10, task: "Write killer GitHub profile README (stats, skill badges)", priority: "🔥", done: false },
    { day: 11, task: "Start building Portfolio Website project", priority: "🔥", done: false },
    { day: 12, task: "Establish 1 commit/day habit — start today", priority: "⭐", done: false },
    { day: 13, task: "Apply to 5 internships on Internshala", priority: "🔥", done: false },
    { day: 14, task: "Post first LinkedIn post (use Growth Engine template)", priority: "⭐", done: false }
  ]},
  { week: 3, title: "Content & Networking", days: [
    { day: 15, task: "Publish a tech post about something you learned this week", priority: "⭐", done: false },
    { day: 16, task: "Connect with 5 HR managers at target companies", priority: "🔥", done: false },
    { day: 17, task: "Send personalized DMs to 3 recruiters (use DM templates)", priority: "🔥", done: false },
    { day: 18, task: "Apply to 10 more internships (LinkedIn + Wellfound)", priority: "🔥", done: false },
    { day: 19, task: "Complete 1 certification (JavaScript on freeCodeCamp)", priority: "⭐", done: false },
    { day: 20, task: "Share a project showcase post with GitHub link", priority: "⭐", done: false },
    { day: 21, task: "Update job tracker with all pending applications", priority: "⭐", done: false }
  ]},
  { week: 4, title: "Acceleration", days: [
    { day: 22, task: "Launch Portfolio Website (deploy on Vercel/Netlify)", priority: "🔥", done: false },
    { day: 23, task: "Add portfolio link to LinkedIn, GitHub bio, email signature", priority: "🔥", done: false },
    { day: 24, task: "Apply to 5 Y Combinator startup internships", priority: "⭐", done: false },
    { day: 25, task: "Write 'Internship Hunt' LinkedIn post requesting referrals", priority: "🔥", done: false },
    { day: 26, task: "Follow up on all pending applications", priority: "⭐", done: false },
    { day: 27, task: "Start building AI Chatbot project (Python + OpenAI)", priority: "⭐", done: false },
    { day: 28, task: "Engage with 5 posts in your niche daily (comment thoughtfully)", priority: "⭐", done: false },
    { day: 29, task: "Request 2 LinkedIn recommendations from seniors/professors", priority: "⭐", done: false },
    { day: 30, task: "Review analytics: profile views, post reach, applications sent", priority: "🔥", done: false }
  ]}
];

const WEEKLY_CHECKLIST = [
  { task: "Post 2-3 times on LinkedIn", category: "Content", done: false },
  { task: "Apply to 10+ internships across boards", category: "Jobs", done: false },
  { task: "Send 20 connection requests to devs/HRs", category: "Network", done: false },
  { task: "Make 7 GitHub commits (1 per day)", category: "Code", done: false },
  { task: "DM 3 recruiters or hiring managers", category: "Outreach", done: false },
  { task: "Follow up on 5 pending applications", category: "Jobs", done: false },
  { task: "Engage with 10 posts in your niche", category: "Network", done: false },
  { task: "Learn one new skill/tool (30 min/day)", category: "Learning", done: false },
  { task: "Update job tracker with new listings", category: "Jobs", done: false },
  { task: "Review and refine LinkedIn profile", category: "Profile", done: false }
];

const CERTIFICATIONS = [
  { name: "JavaScript Algorithms and Data Structures", provider: "freeCodeCamp", skills: ["JavaScript","DS&A"], priority: "🔥 HIGH", link: "https://freecodecamp.org", free: true, time: "~300 hrs" },
  { name: "CS50: Introduction to Computer Science", provider: "edX (Harvard)", skills: ["C","Python","SQL","Web"], priority: "🔥 HIGH", link: "https://cs50.harvard.edu", free: true, time: "~110 hrs" },
  { name: "The Web Developer Bootcamp", provider: "Udemy", skills: ["Node.js","MongoDB","Express","CSS"], priority: "🔥 HIGH", link: "https://udemy.com", free: false, time: "63 hrs" },
  { name: "React — The Complete Guide", provider: "Udemy", skills: ["React","Redux","Hooks"], priority: "⭐ HIGH", link: "https://udemy.com", free: false, time: "48 hrs" },
  { name: "Python for Everybody", provider: "Coursera (Michigan)", skills: ["Python","APIs","Databases"], priority: "⭐ MEDIUM", link: "https://coursera.org", free: true, time: "8 months" },
  { name: "MongoDB for JS Developers", provider: "MongoDB University", skills: ["MongoDB","NoSQL"], priority: "⭐ MEDIUM", link: "https://university.mongodb.com", free: true, time: "~10 hrs" },
  { name: "AWS Cloud Practitioner Essentials", provider: "AWS", skills: ["Cloud","AWS"], priority: "🟡 NICE", link: "https://aws.amazon.com/training", free: true, time: "~6 hrs" },
  { name: "Google UX Design Certificate", provider: "Coursera (Google)", skills: ["UX","Figma","Design"], priority: "🟡 NICE", link: "https://coursera.org", free: false, time: "6 months" }
];

const RECRUITER_KEYWORDS = [
  "Software Engineer Intern","SDE Intern","Web Developer Intern","Frontend Developer",
  "Backend Developer","Full Stack Developer","Node.js Developer","JavaScript Developer",
  "Python Developer","Open to Work","Remote Intern","Fresher","2025 Intern",
  "MERN Stack","REST API","React Developer","Web Development","Computer Science"
];

const JOB_BOARDS = [
  { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/search/?keywords=frontend+intern+remote&f_WT=2", emoji: "💼", tag: "Best for India" },
  { name: "Internshala", url: "https://internshala.com/internships/work-from-home-web-development-internship", emoji: "🎓", tag: "Best for Students" },
  { name: "Wellfound", url: "https://wellfound.com/jobs?role=engineer&remote=true", emoji: "🚀", tag: "Startups" },
  { name: "Naukri", url: "https://www.naukri.com/internship-jobs?k=web+developer+intern&wfhType=1", emoji: "🏢", tag: "India Focus" },
  { name: "RemoteOK", url: "https://remoteok.com/remote-javascript-jobs", emoji: "🌍", tag: "Global Remote" },
  { name: "Y Combinator", url: "https://www.workatastartup.com/jobs?remote=true&role=eng", emoji: "🔶", tag: "YC Startups" },
  { name: "Indeed", url: "https://in.indeed.com/q-software-developer-intern-l-remote-jobs.html", emoji: "🔍", tag: "All Listings" },
  { name: "AngelList", url: "https://wellfound.com/jobs?remote=true", emoji: "👼", tag: "Angel Funded" }
];

const POSTING_TIMES = [
  { day: "Tuesday", time: "8:00 – 10:00 AM IST", reach: "Highest", emoji: "🔥" },
  { day: "Wednesday", time: "12:00 – 2:00 PM IST", reach: "Highest", emoji: "🔥" },
  { day: "Thursday", time: "8:00 – 10:00 AM IST", reach: "High", emoji: "⭐" },
  { day: "Monday", time: "7:00 – 9:00 AM IST", reach: "High", emoji: "⭐" },
  { day: "Friday", time: "10:00 AM – 12:00 PM IST", reach: "Medium", emoji: "🟡" },
  { day: "Saturday", time: "Avoid posting", reach: "Low", emoji: "❌" },
  { day: "Sunday", time: "Avoid posting", reach: "Low", emoji: "❌" }
];

const MESSAGE_TEMPLATES = {
  connection: `Hi [Name]! 👋

I came across your profile and was genuinely impressed by your work at [Company]. I'm Vaibhav Kumar — a 2nd Year CSE student at IPEC Delhi, building my skills in full-stack development with Node.js, JavaScript, and Python.

Would love to connect and learn from your journey in tech! 🚀

My GitHub: github.com/Vaibhav-dev30`,

  recruiterDM: `Hi [Recruiter Name]!

I'm Vaibhav Kumar — a passionate Full-Stack Developer and 2nd Year CSE student at Inderprastha Engineering College, Delhi.

I'm skilled in Node.js, JavaScript, Python, and HTML/CSS — and actively building projects on GitHub (@Vaibhav-dev30).

I noticed [Company] is hiring for [Role] and I'd love to be considered! I'm available immediately for remote internships and am a fast learner who ships code.

Would you be open to a quick chat or could I send you my resume? 🙏`,

  referral: `Hi [Name]! 👋

Hope you're doing great! I've been following your journey at [Company] — truly inspiring.

I'm reaching out because [Company] is hiring for [Role] and I believe I'd be a great fit. I'm a 2nd Year CSE student skilled in Node.js, JavaScript, and Python with hands-on project experience.

If you think I could add value, would you be comfortable referring me? I won't let you down! 🙏

GitHub: github.com/Vaibhav-dev30
Thank you so much!`
};
