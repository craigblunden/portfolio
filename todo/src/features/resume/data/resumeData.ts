export type Role = {
  company: string;
  title: string;
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
  stack: string[];
  link?: { label: string; href: string };
};

export const heroRole: Role = {
  company: "Repeat.gg",
  title: "Full Stack Software Engineer",
  period: "2019 — Present",
  location: "Fortitude Valley, Australia · Sony Interactive Entertainment",
  summary:
    "Building a competitive gaming platform used by millions of players, where gamers compete in tournaments and earn rewards across their favourite titles. Joined pre-acquisition as part of a small startup team and stayed on through the acquisition by Sony Interactive Entertainment, now sitting inside the wider PlayStation family.",
  highlights: [
    "Part of the core team from startup through to major acquisition by Sony Interactive Entertainment.",
    "Ship end-to-end features across web, mobile and backend inside a small, highly focused agile team.",
    "Contribute to a strong microservice and event-driven architecture backed by Kafka, MySQL and MongoDB.",
    "Develop React and React Native experiences alongside Node.js and PHP services running on AWS.",
    "Drive quality with automated testing (Jest, Cypress, Playwright) and a test-driven engineering culture.",
    "Assist with onboarding — participating in technical interviews and technical onboarding new team members.",
    "Early experimentation with agentic AI workflows using GitHub Copilot and Cursor to accelerate delivery.",
    "Collaborate with product, design and QA on technical planning, code reviews and iterative solutions.",
    "Participate in the on-call roster, keeping the platform stable 24/7 for a global player base.",
  ],
  stack: [
    "TypeScript",
    "React",
    "React Native",
    "Node.js",
    "Next.js",
    "PHP",
    "AWS",
    "Kafka",
    "MySQL",
    "MongoDB",
    "Jest",
    "Cypress",
    "Playwright",
  ],
  link: { label: "repeat.gg", href: "https://repeat.gg" },
};

export const priorRoles: Role[] = [
  {
    company: "Flight Centre",
    title: "Front-end Engineer",
    period: "Oct 2018 — 2019",
    summary:
      "Worked on large-scale global travel booking products across AU, NZ and CA, helping transform a legacy platform into a full-stack micro frontend architecture.",
    highlights: [
      "Built React components and Node.js API endpoints for a multi-million dollar revenue generating booking flow.",
      "Delivered key features including the search form, traveller details form and payment forms.",
      "Upgraded the frontend feature set to Material Design, aligning with the Flight Centre design system.",
      "Onboarded new developers and proposed team process improvements.",
    ],
    stack: [
      "React",
      "Node.js",
      "JavaScript",
      "JSS",
      "Micro Frontends",
      "Material UI",
      "Cypress",
      "Cucumber",
      "Jest",
    ],
  },
  {
    company: "Neto eCommerce",
    title: "Design Manager · Team Lead · Front-end Developer",
    period: "Sep 2014 — Oct 2018",
    summary:
      "Retail and wholesale management platform covering eCommerce, POS, inventory and fulfilment. Grew from front-end developer into a design manager leading a team of 11.",
    highlights: [
      "Led a team of 11 project managers, designers and front-end developers across on and offshore.",
      "Serviced some of Australia's biggest online retailers and oversaw hundreds of responsive eCommerce projects.",
      "Awarded the inaugural “Spirit of Neto” by the CEO in 2015 for embodying Neto values.",
      "Liaised with integration partners (InstantSearch+, Algolia), SEO and marketing agencies.",
      "Wrote job descriptions, ran interviews and delivered annual performance reviews.",
    ],
    stack: ["HTML", "CSS", "JavaScript", "jQuery", "Node.js", "Figma", "B@SE"],
  },
  {
    company: "Solatube",
    title: "Front-end Developer",
    period: "Sep 2013 — 2014",
    summary:
      "Solo web developer for Australia's leading manufacturer of skylights and roof ventilation systems, owning their online presence end-to-end.",
    highlights: [
      "Delivered and continuously improved the online experience for customers.",
      "Liaised with external SEO and marketing partners to drive site outcomes.",
      "Worked autonomously, defining and shipping my own initiatives.",
    ],
    stack: ["PHP", "HTML", "CSS", "JavaScript", "WordPress"],
  },
  {
    company: "Orange Digital",
    title: "Front-end Developer (Contract)",
    period: "2013 · 3 months",
    summary:
      "Brisbane-based agency specialising in online marketing strategy, design and web development.",
    highlights: [
      "Built responsive eCommerce sites, slicing and coding designs from Photoshop mockups.",
      "Operated effectively in a fast-paced agency environment, learning the value of quality over speed.",
    ],
    stack: ["HTML", "CSS", "PHP", "Photoshop"],
  },
  {
    company: "Bluewire Media",
    title: "Front-end Developer (Work Experience)",
    period: "2012 — 2013 · 6 months",
    summary:
      "Web strategy consulting firm serving as an outsourced digital marketing team for its clients.",
    highlights: [
      "Resolved UI issues and implemented website feature requests.",
      "Supported the wider team with day-to-day development tasks.",
    ],
    stack: ["HTML", "CSS", "PHP", "Photoshop"],
  },
];

export type SkillGroup = {
  label: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    label: "languages",
    items: ["TypeScript", "JavaScript (ES6+)", "PHP", "HTML", "CSS", "SQL"],
  },
  {
    label: "frameworks",
    items: [
      "React",
      "React Native",
      "Next.js",
      "Node.js",
      "Vue",
      "Material UI",
      "Tailwind CSS",
    ],
  },
  {
    label: "platforms",
    items: [
      "AWS",
      "Serverless",
      "Kafka",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Micro Frontends",
    ],
  },
  {
    label: "quality",
    items: [
      "Jest",
      "Cypress",
      "Playwright",
      "Cucumber",
      "TDD",
      "Code Review",
      "Performance Optimisation",
    ],
  },
  {
    label: "workflow",
    items: [
      "Git / GitHub",
      "CI/CD",
      "Agile / Scrum",
      "JIRA",
      "On-call",
      "Mentoring",
    ],
  },
];

export const highlights = [
  {
    label: "years shipping",
    value: "13+",
    note: "professional experience",
  },
  {
    label: "current focus",
    value: "TS · React · Node",
    note: "full-stack, event-driven",
  },
  {
    label: "scale",
    value: "millions",
    note: "of players & customers served",
  },
];

export const values = [
  "Trailblazer — always learning, always shipping",
  "Passionate — web dev is my career and hobby",
  "One — team-first, inclusive, collaborative",
];
