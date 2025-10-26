// lib/validators/profile.ts
import { z } from 'zod';

export const ContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
});

export const EducationSchema = z.object({
  school: z.string().min(1),
  stream: z.string().optional(),
  yearOfPassing: z.number().int().positive().optional(),
  grade: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  timeline: z.string().optional(),
  description: z.string().max(300).optional(),
});

export const RoleSchema = z.object({
  title: z.string().min(1),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(),
  description: z.string().max(300).optional(),
});

export const ExperienceSchema = z.object({
  company: z.string().min(1),
  roles: z.array(RoleSchema).optional(),
});

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  link: z.string().url().optional(),
});

export const AchievementSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export const SkillSchema = z.object({
  sector: z.string(),
  skills: z.array(z.string()),
});

export const CustomSectionSchema = z.object({
  title: z.string(),
  body: z.record(z.any(), z.any()), // body must be JSON object
});

export const ProfileInputSchema = z.object({
  profilePictures: z.array(z.string()).max(3).optional(),

  contact: ContactSchema.optional(),

  education: z.array(EducationSchema).optional(),
  projects: z.array(ProjectSchema).max(10).optional(),
  experiences: z.array(ExperienceSchema).max(5).optional(),
  certifications: z.array(CertificationSchema).optional(),
  achievements: z.array(AchievementSchema).optional(),

  skills: z.array(SkillSchema).optional(),
  otherSections: z.array(CustomSectionSchema).optional(),
});
