// lib/sample-cv.ts

// Gemini API ကိုခေါ်စရာမလိုဘဲ သုံးနိုင်မယ့် နမူနာ CV data
export const sampleCvJson = {
  personalInfo: {
    name: "Kyaw Phyo Aung",
    phone: "+95-9-440392288",
    email: "kyawphyoaung.me@gmail.com",
    linkedinUrl: "https://linkedin.com/in/kyawphyoaung",
    githubUrl: "https://github.com/kyawphyoaung",
  },
  summary:
    "A passionate software developer with a knack for creating elegant solutions in the least amount of time. Experienced in full-stack development, with a strong focus on modern web technologies like React and Node.js.",
  skills: {
    "Programming Languages": ["JavaScript (ES6+)", "TypeScript", "Python"],
    "Frontend Development": ["React", "Next.js", "Tailwind CSS", "Redux"],
    "Backend Development": ["Node.js", "Express.js", "Prisma", "PostgreSQL"],
    "Cloud & DevOps": ["Docker", "AWS (EC2, S3)", "Vercel", "Git"],
  },
  experience: [
    {
      jobTitle: "Senior Frontend Developer",
      companyName: "Tech Solutions Inc.",
      duration: "Jan 2022 - Present",
      responsibilities: [
        "Led the development of a new client-facing dashboard using Next.js, resulting in a 20% increase in user engagement.",
        "Mentored junior developers and conducted code reviews to maintain code quality.",
        "Collaborated with UX/UI designers to implement responsive and user-friendly interfaces.",
      ],
    },
    {
      jobTitle: "Software Engineer",
      companyName: "Innovate Co.",
      duration: "Jun 2020 - Dec 2021",
      responsibilities: [
        "Developed and maintained RESTful APIs for the company's main product.",
        "Wrote unit and integration tests to ensure software reliability.",
        "Participated in the full software development lifecycle, from planning to deployment.",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      university: "University of Technology, Yangon",
      duration: "2016 - 2020",
    },
  ],
  leadership: [
    {
      organization: "University Coding Club",
      role: "President",
      duration: "2019 - 2020",
      details: "Organized weekly coding workshops and an annual hackathon for over 100 students."
    }
  ]
};
