# Resume Builder Application — Implementation Plan (Next.js + Gemini + MongoDB)

## Overview

This document provides a detailed, step-by-step roadmap for developing a **Resume Builder Application** powered by **Next.js**, **Google Authentication**, **Gemini AI**, and **MongoDB**.  
The application allows users to authenticate, manage their profile data, generate resumes via AI, preview and edit them in-browser, and store the results securely.

---

## 🧩 1. Project Scope

### 1.1 Objectives
- Enable users to build AI-powered resumes quickly and professionally.
- Allow login via Google OAuth.
- Provide a dashboard for managing profile data (education, projects, experiences, etc.).
- Support AI-based custom resume generation based on job descriptions.
- Offer live PDF preview and in-app editing capabilities.
- Enable AI assistance during PDF editing.
- Store resumes securely on the cloud.
- Provide a clean, responsive, minimal UI.

### 1.2 Features Summary
| Feature | Description |
|----------|--------------|
| Authentication | Google OAuth via NextAuth.js |
| Profile Management | Save personal, education, experience, projects, achievements, certifications |
| AI Resume Builder | Use Gemini API to generate resumes dynamically |
| Custom Resume | Generate resumes tailored to job descriptions |
| Resume Preview | View/edit resumes using PDF.js and text editor overlay |
| AI Assistance | Gemini-based suggestions during editing |
| Cloud Storage | Store generated resumes (e.g., Cloudinary / Supabase Storage / Firebase) |
| Dashboard | Auth-protected workspace |
| Landing Page | Public homepage showing app purpose and usage guide |

---

## ⚙️ 2. Tech Stack

| Layer | Technology | Notes |
|-------|-------------|-------|
| Frontend & Backend | **Next.js 14 (App Router)** | Unified fullstack framework |
| Language | **TypeScript** | Type safety |
| UI | **TailwindCSS + shadcn/ui** | Modern, minimal UI |
| Auth | **NextAuth.js (Google Provider)** | Secure OAuth2 login |
| Database | **MongoDB + Mongoose** | Schema flexibility for user data |
| AI Integration | **Gemini API (Google Generative AI)** | Resume generation & editing |
| File Storage | **Cloudinary / Firebase Storage** | Resume & image uploads |
| PDF Rendering | **pdf.js / react-pdf** | Resume preview & inline editing |
| Deployment | **Vercel** | Frontend + backend hosting |
| Optional | **Railway / Render** | For alternative backend hosting if needed |

---

## 🧱 3. Database Schema Design

### 3.1 Collections

#### **User**
```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  image: string, // profile photo
  createdAt: Date,
  updatedAt: Date
}
```

#### **Profile**
```ts
{
  userId: ObjectId,
  personal: {
    name: string,
    email: string,
    phone: string,
    address: string,
    summary: string
  },
  education: [{ degree, institute, startYear, endYear, score }],
  projects: [{ title, description, techStack, link }],
  experience: [{ company, position, duration, description }],
  achievements: [string],
  certifications: [{ title, issuer, year }],
  headshotUrl: string,
  updatedAt: Date
}
```

#### **Resume**
```ts
{
  userId: ObjectId,
  title: string,
  jobDescription: string,
  resumeUrl: string, // cloud location
  aiPromptUsed: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🪜 4. Implementation Roadmap

### Phase 1 — Project Setup
1. Initialize Next.js project with TypeScript:  
   ```bash
   npx create-next-app@latest resume-builder --typescript --app
   ```
2. Install dependencies:
   ```bash
   npm install next-auth mongoose tailwindcss shadcn-ui @google/generative-ai pdfjs-dist react-pdf cloudinary
   ```
3. Configure Tailwind and shadcn:
   ```bash
   npx shadcn-ui init
   ```
4. Setup `.env.local` for:
   - MongoDB URI
   - Google OAuth client credentials
   - Gemini API key
   - Cloudinary API key

---

### Phase 2 — Authentication
1. Configure **NextAuth.js** using Google provider.  
2. Create `api/auth/[...nextauth]/route.ts` for auth routes.  
3. Protect `/dashboard` and API routes with session middleware.  
4. Store user info in MongoDB upon first login.

---

### Phase 3 — Database & Models
1. Connect MongoDB using `mongoose` in `/lib/db.ts`.  
2. Define schemas for `User`, `Profile`, and `Resume`.  
3. Write reusable model accessors (CRUD functions).

---

### Phase 4 — Landing Page
1. Create a public landing page at `/`:
   - Headline: “AI-Powered Resume Builder”
   - Steps: Login → Fill Profile → Generate → Preview → Export
   - CTA button linking to `/dashboard`
2. Add clean, responsive UI with shadcn cards and Tailwind.

---

### Phase 5 — Dashboard
1. Create `/dashboard` route protected by session.  
2. Tabs for:
   - Profile
   - Resume Builder
   - My Resumes
3. Show user profile summary on top.

---

### Phase 6 — Profile Management
1. Create form components for each section:
   - Personal Info
   - Education
   - Projects (max 10)
   - Experience (max 5)
   - Achievements
   - Certifications
2. Connect forms to backend via API routes:
   - `POST /api/profile`
   - `GET /api/profile`
   - `PUT /api/profile`
3. Allow profile picture upload to Cloudinary.

---

### Phase 7 — Resume Builder
1. Create a Resume Builder UI:
   - Select existing profile data.
   - Add job description input (optional).
   - Generate resume button.
2. Call Gemini API with structured prompt:
   - Merge profile data + job description context.
   - Receive AI-generated resume text.
3. Store generated resume text and metadata in MongoDB.

---

### Phase 8 — Resume Preview & Editing
1. Render resume with `pdf.js` or `react-pdf`.  
2. Enable editable overlay (e.g., `contenteditable` div or Quill editor).  
3. Save edits to MongoDB or temporary state.  
4. Provide “Download as PDF” and “Save to Cloud” options.

---

### Phase 9 — AI Assistance in Editing
1. Add Gemini-powered text editing suggestions:
   - Use prompts like “Improve this section for clarity.”
2. Display inline AI suggestion popups near text selections.
3. Allow user to accept or reject suggestions.

---

### Phase 10 — Resume Storage & Management
1. Upload final resume PDF to Cloudinary / Firebase.  
2. Store file URL in `Resume` collection.  
3. Display all generated resumes in `/dashboard/my-resumes`.  
4. Allow delete, re-generate, and download.

---

### Phase 11 — Final Touches
1. Add loading states, toasts, and confirmations (via `sonner` or `toast` from shadcn).  
2. Ensure responsive UI for mobile.  
3. Optimize API routes with caching.  
4. Add error handling and logging.

---

### Phase 12 — Deployment
1. Deploy frontend + backend to **Vercel**.  
2. Connect **MongoDB Atlas**.  
3. Verify environment variables.  
4. Test all API routes and flows.  
5. Configure custom domain and SSL.

---

## 🧠 5. Gemini API Prompt Example

```text
You are an expert resume writer. Based on the user’s profile data and the following job description, generate a professional resume in clean text format with structured sections (Summary, Education, Projects, Experience, Achievements, Skills). Ensure concise and impactful phrasing.

Profile Data:
<insert JSON>

Job Description:
<insert JD text>
```

---

## 📅 6. Project Timeline (Estimated)

| Phase | Duration | Deliverables |
|--------|-----------|---------------|
| Setup & Auth | 3 days | Project setup + Google Login |
| Database & Models | 2 days | Mongoose schemas |
| Landing Page | 1 day | Public site |
| Dashboard & Profile | 4 days | Profile CRUD + Upload |
| Resume Builder | 4 days | Gemini integration |
| PDF Preview & Editing | 5 days | Live editable resume |
| AI Editing Assistance | 3 days | Gemini-based editing |
| Storage & Polishing | 3 days | Resume management |
| Deployment & Testing | 2 days | Final launch |

**Total: ~27 days (≈ 4 weeks)**

---

## 🧾 7. Future Enhancements
- Template selection for resume themes.
- Multi-language resume generation.
- Collaborative resume editing.
- Analytics for resume performance tracking.
- Integration with LinkedIn APIs.

---

## ✅ 8. Deliverables
- Fullstack Next.js app (frontend + backend)
- MongoDB Atlas connection
- Integrated Gemini AI resume generation
- Editable PDF preview interface
- Cloud resume storage and management
- Deployed app on Vercel with CI/CD

---

**Author:** Aman Modi  
**Date:** October 2025  
**Version:** 1.0.0
