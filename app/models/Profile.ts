// models/Profile.ts
import { Schema, model, models } from 'mongoose';

const EducationSchema = new Schema({
  school: { type: String },
  stream: { type: String },
  yearOfPassing: { type: Number },
  grade: { type: String }, // percentage or GPA string
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String },
  timeline: { type: String },
  description: { type: String, maxlength: 300 },
});

const RoleSchema = new Schema({
  title: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, maxlength: 300 },
});

const ExperienceSchema = new Schema({
  company: { type: String },
  roles: { type: [RoleSchema], default: [] },
});

const CertificationSchema = new Schema({
  name: String,
  issuer: String,
  date: Date,
  link: String,
});

const AchievementSchema = new Schema({
  title: String,
  description: String,
});

const SkillSchema = new Schema({
  sector: String,
  skills: { type: [String], default: [] },
});

const CustomSectionSchema = new Schema({
  title: String,
  body: { type: Schema.Types.Mixed }, // JSON object
});

const ContactSchema = new Schema({
  email: String,
  phone: String,
  website: String,
  linkedin: String,
  github: String,
  twitter: String,
});

const ProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    profilePictures: { type: [String], default: [], maxlength: 3 },

    contact: { type: ContactSchema, default: {} },

    education: { type: [EducationSchema], default: [] },
    projects: {
      type: [ProjectSchema],
      default: [],
      validate: (v: any) => v.length <= 10,
    },
    experiences: {
      type: [ExperienceSchema],
      default: [],
      validate: (v: any) => v.length <= 5,
    },
    certifications: { type: [CertificationSchema], default: [] },
    achievements: { type: [AchievementSchema], default: [] },

    skills: { type: [SkillSchema], default: [] },
    otherSections: { type: [CustomSectionSchema], default: [] },
  },
  { timestamps: true }
);

const Profile = models.Profile || model('Profile', ProfileSchema);
export default Profile;
