export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string[];
}

export interface VentureItem {
  id: string;
  name: string;
  role: string;
  period: string;
  description: string[];
  link?: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  location: string;
  period: string;
  details: string[];
}

export interface SkillItem {
  name: string;
  level: number; // 0-100
  category: 'Tech' | 'Business' | 'Language';
}