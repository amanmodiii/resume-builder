// lib/validators/profile.ts
import { z } from 'zod';

// Helper for URL validation that allows empty strings
const optionalUrl = z
  .string()
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL or empty',
  })
  .optional();

export const ContactSchema = z.object({
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z
    .string()
    .regex(
      /^[\d\s\-\+\(\)]*$/,
      'Phone must contain only numbers and basic formatting'
    )
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone must be at most 20 characters')
    .or(z.literal(''))
    .optional(),
  website: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
  twitter: optionalUrl,
});

export const EducationSchema = z.object({
  school: z.string().min(1, 'School name is required').max(200),
  stream: z.string().max(100).optional(),
  yearOfPassing: z
    .number()
    .int()
    .min(1950, 'Year must be after 1950')
    .max(
      new Date().getFullYear() + 10,
      'Year cannot be more than 10 years in the future'
    )
    .optional(),
  grade: z.string().max(50).optional(),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  url: optionalUrl,
  timeline: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
});

export const RoleSchema = z
  .object({
    title: z.string().min(1, 'Role title is required').max(200),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().max(5000).optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      if (data.endDate.toLowerCase() === 'present') return true;
      try {
        return new Date(data.startDate) <= new Date(data.endDate);
      } catch {
        return true;
      }
    },
    { message: 'End date must be after start date', path: ['endDate'] }
  );

export const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  roles: z.array(RoleSchema).min(1, 'At least one role is required').optional(),
});

export const CertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(200),
  issuer: z.string().max(200).optional(),
  date: z.string().optional(),
  link: optionalUrl,
});

export const AchievementSchema = z.object({
  title: z.string().min(1, 'Achievement title is required').max(200),
  description: z.string().max(1000).optional(),
});

export const SkillSchema = z.object({
  sector: z.string().min(1, 'Sector name is required').max(100),
  skills: z
    .array(z.string().min(1).max(100))
    .min(1, 'At least one skill is required'),
});

export const CustomSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required').max(200),
  body: z.record(z.string(), z.any()),
});

export const ProfileInputSchema = z.object({
  profilePictures: z
    .array(z.string().url('Must be a valid URL'))
    .max(3, 'Maximum 3 profile pictures allowed')
    .optional(),

  contact: ContactSchema.optional(),

  education: z
    .array(EducationSchema)
    .max(10, 'Maximum 10 education entries')
    .optional(),
  projects: z.array(ProjectSchema).max(20, 'Maximum 20 projects').optional(),
  experiences: z
    .array(ExperienceSchema)
    .max(10, 'Maximum 10 experiences')
    .optional(),
  certifications: z
    .array(CertificationSchema)
    .max(30, 'Maximum 30 certifications')
    .optional(),
  achievements: z
    .array(AchievementSchema)
    .max(30, 'Maximum 30 achievements')
    .optional(),

  skills: z.array(SkillSchema).max(20, 'Maximum 20 skill sectors').optional(),
  customSections: z
    .array(CustomSectionSchema)
    .max(10, 'Maximum 10 custom sections')
    .optional(),
});
