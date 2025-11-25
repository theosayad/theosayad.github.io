import { ExperienceItem, VentureItem, EducationItem, SkillItem } from './types';

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/theosayad",
  instagram: "https://www.instagram.com/theosayad/?hl=en",
  email: "sayadtheos@gmail.com",
  website: "https://theosayad.com",
  phone: "+49 163 1563576"
};

export const BIO_TEXT = [
  "I've always loved business. At only the age of 11, I found myself selling fidget spinners imported from Alibaba at school.",
  "At 13, I founded my first venture reselling sneakers and streetwear in the UAE and Lebanon (Hypelife). Two years later, I founded a startup streetwear brand called Disrupted.",
  "In 2021, I dived into the world of cryptocurrencies and developed 40+ crypto projects on the Binance, Ethereum, and Solana chains managing them entirely—from the contract development (using Solidity), to the community management, and marketing.",
  "I am currently a Bachelor's Student at ESCP Business School studying in Paris, Turin and Berlin."
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    id: "mevp",
    role: "VC Intern",
    company: "Middle East Venture Partners",
    location: "Beirut, Lebanon",
    period: "Aug. 2025 - Sep. 2025",
    description: [
      "Led a high-stakes market-sizing project for the $1.4T Business Travel sector (KSA/US/EU), identifying a specific $200M+ opportunity gap.",
      "Presented strategic GTM (Go-to-Market) findings directly to Senior Partners, influencing investment focus areas."
    ]
  },
  {
    id: "transmed",
    role: "Operations Intern",
    company: "Transmed",
    location: "Dubai, UAE",
    period: "Jun. 2025 - Jul. 2025",
    description: [
      "Processed and analysed a 50,000+ SKU dataset to identify supply chain bottlenecks and 'out-of-stock' patterns.",
      "Bridged the gap between sales forecasts and supply planning, directly improving service-level agreements (SLAs) for major retail accounts."
    ]
  },
  {
    id: "wakilni",
    role: "Commercial Operations Assistant",
    company: "Wakilni",
    location: "Beirut, Lebanon",
    period: "Jul. 2024 - Oct. 2024",
    description: [
      "Audited sales operations and implemented automated product entry tools, reducing manual data entry by 20% and freeing up weekly team capacity.",
      "Scouted and onboarded 6 high-volume B2B vendors, streamlining the onboarding flow to reduce time-to-revenue."
    ]
  },
  {
    id: "seez",
    role: "Marketing Intern",
    company: "Seez",
    location: "Dubai, UAE",
    period: "May 2024 - Jul. 2024",
    description: [
      "Designed and executed targeted digital advertising campaigns to drive adoption for the company's new AI chatbot, 'Seezar'.",
      "Supported performance analysis and evaluated Meta ad campaigns using platform dashboards to identify areas for budget reallocation and optimisation."
    ]
  }
];

export const VENTURES_DATA: VentureItem[] = [
  {
    id: "sowk",
    name: "SOWK Guesthouse",
    role: "Founder & Operator",
    period: "2025 - Present",
    description: [
      "Built a fully automated booking and logistics system to manage a boutique Airbnb, achieving Superhost status via superior UX.",
      "Developed the website from scratch."
    ],
    link: "https://sowk.org"
  },
  {
    id: "web3",
    name: "Web3 & DeFi Developer",
    role: "Independent",
    period: "2020 - 2023",
    description: [
      "Managed the full lifecycle of a blockchain project using Solidity, handling smart contract deployment and liquidity strategy.",
      "Successfully pitched complex digital asset mechanics to investors, securing liquidity for project launch."
    ]
  },
  {
    id: "disrupted",
    name: "Disrupted Worldwide",
    role: "Founder",
    period: "2019 - 2023",
    description: [
      "Founded a niche streetwear brand at 14; managed design-to-distribution pipeline and built loyal customer base."
    ],
    link: "https://www.instagram.com/disruptedww/"
  },
  {
    id: "hypelife",
    name: "HypeLife MENA",
    role: "Founder",
    period: "2016 - 2022",
    description: [
      "Built a sneaker resale business bridging US suppliers with UAE demand.",
      "Executed 200+ transactions and managed end-to-end logistics and customs clearance."
    ],
    link: "https://www.instagram.com/hypelifedxb/"
  }
];

export const EDUCATION_DATA: EducationItem[] = [
  {
    school: "ESCP Business School",
    degree: "BSc in Management (Specialisation in Finance & Data)",
    location: "Paris, Turin, and Berlin",
    period: "2023 - 2026",
    details: [
      "Academics: GPA 3.9/4.0 (Dean's List).",
      "Relevant Modules: Corporate Finance, Statistics, Python for Business."
    ]
  },
  {
    school: "Nord Anglia School",
    degree: "IB Diploma",
    location: "Dubai, UAE",
    period: "2018 - 2023",
    details: [
      "Score: 40/45. High Levels: Computer Science, Economics, Math AA.",
      "Extended Essay: Analyzed market share impacts of PSA-FCA merger (Grade A)."
    ]
  }
];

export const SKILLS_DATA: SkillItem[] = [
  { name: "Python", level: 90, category: "Tech" },
  { name: "Solidity", level: 85, category: "Tech" },
  { name: "SQL", level: 75, category: "Tech" },
  { name: "Negotiation", level: 95, category: "Business" },
  { name: "Project Mgmt", level: 90, category: "Business" },
  { name: "Leadership", level: 85, category: "Business" },
  { name: "English", level: 100, category: "Language" },
  { name: "French", level: 100, category: "Language" },
  { name: "Arabic", level: 100, category: "Language" },
  { name: "Italian", level: 40, category: "Language" },
  { name: "Mandarin", level: 40, category: "Language" },
];