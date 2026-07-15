import {
  BarChart,
  Bot,
  Boxes,
  Code2,
  Hammer,
  Handshake,
  LayoutDashboard,
  MessagesSquare,
  Network,
  Plane,
  Recycle,
  Rocket,
  ShieldCheck,
  Siren,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type HighlightItem = {
  icon: LucideIcon;
  text: string;
};

export type Role = {
  company: string;
  title: string;
  period: string;
  location?: string;
  summary: string;
  highlights: HighlightItem[];
  primaryAchievements?: HighlightItem[];
  stack: string[];
  link?: { label: string; href: string };
};

export const heroRole: Role = {
  company: "Repeat.gg",
  title: "Full Stack Software Engineer",
  period: "2019 — Present",
  location: "Fortitude Valley, Australia · Sony Interactive Entertainment",
  summary:
    "Building a competitive gaming platform used by tens of thousands of daily active users, where gamers compete in tournaments and earn rewards across their favourite titles. Joined pre-acquisition as part of a small startup team and stayed on through the acquisition by Sony Interactive Entertainment, now sitting inside the wider PlayStation family.",
  highlights: [
    {
      icon: Rocket,
      text: "Part of the core team from startup through to major acquisition by Sony Interactive Entertainment.",
    },
    {
      icon: Boxes,
      text: "Ship end-to-end features across web, mobile and backend inside a small, highly focused agile team.",
    },
    {
      icon: Network,
      text: "Contribute to the microservices and event-driven architecture backed by Kafka, MySQL and MongoDB.",
    },
    {
      icon: Code2,
      text: "Develop React and React Native experiences alongside Node.js and PHP services running on AWS.",
    },
    {
      icon: ShieldCheck,
      text: "Drive quality with automated testing (Jest, Cypress, Playwright) and a test-driven engineering culture.",
    },
    {
      icon: UserPlus,
      text: "Assist with onboarding — participating in technical interviews and technical onboarding of new team members.",
    },
    {
      icon: Bot,
      text: "Early experimentation with agentic AI workflows using GitHub Copilot and Cursor to accelerate delivery.",
    },
    {
      icon: MessagesSquare,
      text: "Collaborate with product, design and QA on technical planning, code reviews and iterative solutions.",
    },
    {
      icon: Siren,
      text: "Participate in the on-call roster, keeping the platform stable 24/7 for a global player base.",
    },
  ],
  primaryAchievements: [
    {
      icon: Recycle,
      text: "Migrated the UI from PHP / Twig to React, with proof-of-concept work delivered to move the platform towards Next.js.",
    },
    {
      icon: Trophy,
      text: "Assisted with the delivery of new tournament formats and scoring systems used by tens of thousands of daily active users.",
    },
    {
      icon: Rocket,
      text: "Consistently reviewed as a key contributor to high-impact over multiple years, exceeding the expectations of the role.",
    },
    {
      icon: LayoutDashboard,
      text: "Created architecture designs for new features, aligning engineering, product and design early in the process.",
    },
    {
      icon: Bot,
      text: "Created the original foundation for Jarvis, a Next.js / NestJS admin tool used by support and game admin teams to keep the platform running across content, moderation, order fulfillment and payments.",
    },
    {
      icon: Plane,
      text: "Travelled to San Francisco to network with the wider Sony Interactive global esports team and attend Game Developers Conference.",
    },
    {
      icon: BarChart,
      text: "Collaborated with wider Sony Interactive teams to integrate Adobe Analytics into critical user flows.",
    },
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
      {
        icon: Code2,
        text: "Built React components and Node.js API endpoints for a multi-million dollar revenue generating booking flow.",
      },
      {
        icon: Rocket,
        text: "Enhanced existing features including the booking flow, search form, traveller details form and payment forms.",
      },
      {
        icon: LayoutDashboard,
        text: "Upgraded the frontend feature set to Material Design, aligning with the Flight Centre design system.",
      },
      {
        icon: UserPlus,
        text: "Onboarded new developers and proposed team process improvements.",
      },
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
      {
        icon: Users,
        text: "Led a team of 11 project managers, designers and front-end developers across on and offshore.",
      },
      {
        icon: Rocket,
        text: "Serviced some of Australia's biggest online retailers and oversaw hundreds of responsive eCommerce projects.",
      },
      {
        icon: Trophy,
        text: "Awarded the inaugural “Spirit of Neto” by the CEO in 2015 for embodying Neto values.",
      },
      {
        icon: Handshake,
        text: "Liaised with integration partners (InstantSearch+, Algolia), SEO and marketing agencies.",
      },
      {
        icon: MessagesSquare,
        text: "Ran interviews and delivered annual performance reviews.",
      },
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
      {
        icon: Hammer,
        text: "Delivered and continuously improved the online experience for customers.",
      },
      {
        icon: Handshake,
        text: "Liaised with external SEO and marketing partners to drive site outcomes.",
      },
      {
        icon: Rocket,
        text: "Worked autonomously, defining and shipping my own initiatives.",
      },
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
      {
        icon: Code2,
        text: "Built responsive eCommerce sites, slicing and coding designs from Photoshop mockups.",
      },
      {
        icon: ShieldCheck,
        text: "Operated effectively in a fast-paced agency environment, learning the value of quality over speed.",
      },
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
      {
        icon: Hammer,
        text: "Resolved UI issues and implemented website feature requests.",
      },
      {
        icon: Users,
        text: "Supported the wider team with day-to-day development tasks.",
      },
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
    value: "10s of thousands",
    note: "of daily active users served",
  },
];

export const values = [
  "Trailblazer — always learning, always shipping",
  "Passionate — web dev is my career and hobby",
  "One — team-first, inclusive, collaborative",
];
