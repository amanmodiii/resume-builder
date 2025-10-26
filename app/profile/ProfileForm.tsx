"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { X, Edit2, Save, Trash2, Plus, ExternalLink, Mail, Phone, Globe, Linkedin, Github, Twitter, Calendar, Building, Award, Briefcase, GraduationCap, Code, Star, AlertCircle } from "lucide-react";

// Shadcn UI Imports
import { cn } from "@/lib/utils"; // Adjust this path if your utils file is elsewhere
import { Button } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- TYPE DEFINITIONS (from your target code) ---
type Role = {
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type Experience = {
  company?: string;
  roles: Role[];
};

type Education = {
  school?: string;
  stream?: string;
  yearOfPassing?: number | "";
  grade?: string;
};

type Project = {
  name?: string;
  url?: string;
  timeline?: string;
  description?: string;
};

type Skill = {
  sector?: string;
  skills: string[];
};

type Certification = {
  name?: string;
  issuer?: string;
  date?: string;
  link?: string;
};

type Achievement = {
  title?: string;
  description?: string;
};

type CustomSection = {
  title?: string;
  body: Record<string, any>;
};

type Contact = {
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
};

type Profile = {
  contact: Contact;
  profilePictures: string[];
  education: Education[];
  projects: Project[];
  experiences: Experience[];
  certifications: Certification[];
  achievements: Achievement[];
  skills: Skill[];
  customSections: CustomSection[];
};

const DEFAULT_PROFILE: Profile = {
  contact: {},
  profilePictures: [],
  education: [],
  projects: [],
  experiences: [],
  certifications: [],
  achievements: [],
  skills: [],
  customSections: [],
};

// --- MAIN COMPONENT ---
export default function ProfileViewEdit() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [editingProfile, setEditingProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok && res.status !== 404) throw new Error("Failed to fetch");
      const data = await res.json();
      const sanitized = sanitizeProfile(data);
      setProfile(sanitized);
      setEditingProfile(JSON.parse(JSON.stringify(sanitized)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeProfile = (data: any): Profile => ({
    contact: data.contact || {},
    profilePictures: Array.isArray(data.profilePictures) ? data.profilePictures : [],
    education: Array.isArray(data.education) ? data.education : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    experiences: Array.isArray(data.experiences) ? data.experiences : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    customSections: Array.isArray(data.customSections) ? data.customSections : [],
  });

  const handleEdit = () => {
    setEditingProfile(JSON.parse(JSON.stringify(profile)));
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditingProfile(JSON.parse(JSON.stringify(profile)));
    setIsEditing(false);
    setError(null);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT", // Using PUT as in your target code
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProfile),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Save failed");
      }
      const data = await res.json();
      const sanitized = sanitizeProfile(data);
      setProfile(sanitized);
      setEditingProfile(sanitized);
      setIsEditing(false);
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- STATE HELPERS (Unchanged) ---
  const updateField = (path: string[], value: any) => {
    setEditingProfile((prev) => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]]) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return copy;
    });
  };

  const addArrayItem = (key: keyof Profile, item: any) => {
    setEditingProfile((p) => ({ ...p, [key]: [...(p[key] as any[]), item] }));
  };

  const removeArrayItem = (key: keyof Profile, index: number) => {
    setEditingProfile((p) => {
      const arr = [...(p[key] as any[])];
      arr.splice(index, 1);
      return { ...p, [key]: arr };
    });
  };

  const updateArrayItem = (key: keyof Profile, index: number, patch: any) => {
    setEditingProfile((p) => {
      const arr = [...(p[key] as any[])];
      arr[index] = { ...arr[index], ...patch };
      return { ...p, [key]: arr };
    });
  };

  const addRole = (expIndex: number) => {
    setEditingProfile((p) => {
      const exps = [...p.experiences];
      if (!exps[expIndex]) exps[expIndex] = { company: "", roles: [] };
      exps[expIndex].roles = [...(exps[expIndex].roles || []), {}];
      return { ...p, experiences: exps };
    });
  };

  const updateRole = (expIndex: number, roleIndex: number, patch: Partial<Role>) => {
    setEditingProfile((p) => {
      const exps = JSON.parse(JSON.stringify(p.experiences));
      exps[expIndex].roles[roleIndex] = { ...exps[expIndex].roles[roleIndex], ...patch };
      return { ...p, experiences: exps };
    });
  };

  const removeRole = (expIndex: number, roleIndex: number) => {
    setEditingProfile((p) => {
      const exps = JSON.parse(JSON.stringify(p.experiences));
      exps[expIndex].roles.splice(roleIndex, 1);
      return { ...p, experiences: exps };
    });
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const displayProfile = isEditing ? editingProfile : profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isEditing ? "Edit Profile" : "My Profile"}
              </h1>
              <p className="text-gray-600">
                {isEditing ? "Make changes to your professional profile" : "Your professional information at a glance"}
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-md h-auto"
                >
                  <Edit2 size={20} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="px-6 py-3 rounded-xl transition-all h-auto"
                  >
                    <X size={20} className="mr-2" />
                    Cancel
                  </Button>

                  <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={saving}
                        className="px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-md h-auto bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <Save size={20} className="mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to save these changes to your profile? This will update your public information.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSave} disabled={saving}>
                          {saving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            "Confirm & Save"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Contact Section (Refactored with Card) */}
        <Card className="p-8 mb-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="text-blue-600" size={28} />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input icon={<Mail size={18} />} placeholder="Email" value={displayProfile.contact.email || ""} onChange={(v: any) => updateField(["contact", "email"], v)} />
                <Input icon={<Phone size={18} />} placeholder="Phone" value={displayProfile.contact.phone || ""} onChange={(v: any) => updateField(["contact", "phone"], v)} />
                <Input icon={<Globe size={18} />} placeholder="Website" value={displayProfile.contact.website || ""} onChange={(v: any) => updateField(["contact", "website"], v)} />
                <Input icon={<Linkedin size={18} />} placeholder="LinkedIn URL" value={displayProfile.contact.linkedin || ""} onChange={(v: any) => updateField(["contact", "linkedin"], v)} />
                <Input icon={<Github size={18} />} placeholder="GitHub URL" value={displayProfile.contact.github || ""} onChange={(v: any) => updateField(["contact", "github"], v)} />
                <Input icon={<Twitter size={18} />} placeholder="Twitter URL" value={displayProfile.contact.twitter || ""} onChange={(v: any) => updateField(["contact", "twitter"], v)} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProfile.contact.email && <ContactItem icon={<Mail size={18} />} label="Email" value={displayProfile.contact.email} link={`mailto:${displayProfile.contact.email}`} />}
                {displayProfile.contact.phone && <ContactItem icon={<Phone size={18} />} label="Phone" value={displayProfile.contact.phone} link={`tel:${displayProfile.contact.phone}`} />}
                {displayProfile.contact.website && <ContactItem icon={<Globe size={18} />} label="Website" value={displayProfile.contact.website} link={displayProfile.contact.website} />}
                {displayProfile.contact.linkedin && <ContactItem icon={<Linkedin size={18} />} label="LinkedIn" value="View Profile" link={displayProfile.contact.linkedin} />}
                {displayProfile.contact.github && <ContactItem icon={<Github size={18} />} label="GitHub" value="View Profile" link={displayProfile.contact.github} />}
                {displayProfile.contact.twitter && <ContactItem icon={<Twitter size={18} />} label="Twitter" value="View Profile" link={displayProfile.contact.twitter} />}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Section
          icon={<GraduationCap className="text-purple-600" size={28} />}
          title="Education"
          items={displayProfile.education}
          isEditing={isEditing}
          onAdd={() => addArrayItem("education", { school: "", stream: "", yearOfPassing: "", grade: "" })}
          renderView={(edu: { school: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; stream: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; yearOfPassing: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; grade: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
            <div key={i} className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="font-bold text-lg text-gray-900">{edu.school}</h3>
              {edu.stream && <p className="text-gray-700">{edu.stream}</p>}
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                {edu.yearOfPassing && <span>Graduated: {edu.yearOfPassing}</span>}
                {edu.grade && <span>Grade: {edu.grade}</span>}
              </div>
            </div>
          )}
          renderEdit={(edu: { school: any; stream: any; yearOfPassing: any; grade: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input placeholder="School/University" value={edu.school || ""} onChange={(v: any) => updateArrayItem("education", i, { school: v })} />
                <Input placeholder="Field of Study" value={edu.stream || ""} onChange={(v: any) => updateArrayItem("education", i, { stream: v })} />
                <Input type="number" placeholder="Year of Passing" value={edu.yearOfPassing || ""} onChange={(v: any) => updateArrayItem("education", i, { yearOfPassing: v ? Number(v) : "" })} />
                <Input placeholder="Grade/GPA" value={edu.grade || ""} onChange={(v: any) => updateArrayItem("education", i, { grade: v })} />
              </div>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeArrayItem("education", i)}>
                <Trash2 size={16} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        />

        {/* Experience */}
        <Section
          icon={<Briefcase className="text-blue-600" size={28} />}
          title="Experience"
          items={displayProfile.experiences}
          isEditing={isEditing}
          onAdd={() => addArrayItem("experiences", { company: "", roles: [] })}
          renderView={(exp: { company: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; roles: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
              <h3 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                <Building size={20} />
                {exp.company}
              </h3>
              {(exp.roles || []).map((role: { title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; startDate: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; endDate: any; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, rIdx: React.Key | null | undefined) => (
                <div key={rIdx} className="ml-4 mb-3 pb-3 border-b last:border-0">
                  <p className="font-semibold text-gray-800">{role.title}</p>
                  {(role.startDate || role.endDate) && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Calendar size={14} />
                      {role.startDate} - {role.endDate || "Present"}
                    </p>
                  )}
                  {role.description && <p className="text-gray-700 mt-2">{role.description}</p>}
                </div>
              ))}
            </div>
          )}
          renderEdit={(exp: { company: any; roles: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <Input placeholder="Company Name" value={exp.company || ""} onChange={(v: any) => updateArrayItem("experiences", i, { company: v })} className="mb-3" />
              <div className="ml-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">Roles</h4>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => addRole(i)}>
                    <Plus size={16} className="mr-1" /> Add Role
                  </Button>
                </div>
                {(exp.roles || []).map((role: { title: any; startDate: any; endDate: any; description: any; }, rIdx: React.Key | null | undefined) => (
                  <div key={rIdx} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <Input placeholder="Role Title" value={role.title || ""} onChange={(v: any) => updateRole(i, rIdx, { title: v })} className="mb-2" />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input placeholder="Start Date (YYYY-MM-DD)" value={role.startDate || ""} onChange={(v: any) => updateRole(i, rIdx, { startDate: v })} />
                      <Input placeholder="End Date or 'Present'" value={role.endDate || ""} onChange={(v: any) => updateRole(i, rIdx, { endDate: v })} />
                    </div>
                    <Textarea
                      placeholder="Description"
                      value={role.description || ""}
                      onChange={(e) => updateRole(i, rIdx, { description: e.target.value })}
                      rows={3}
                    />
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 mt-2" onClick={() => removeRole(i, rIdx)}>
                      <Trash2 size={14} className="mr-1" /> Remove Role
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 mt-3" onClick={() => removeArrayItem("experiences", i)}>
                <Trash2 size={16} className="mr-1" /> Remove Company
              </Button>
            </div>
          )}
        />

        {/* Projects */}
        <Section
          icon={<Code className="text-green-600" size={28} />}
          title="Projects"
          items={displayProfile.projects}
          isEditing={isEditing}
          onAdd={() => addArrayItem("projects", { name: "", url: "", timeline: "", description: "" })}
          renderView={(proj: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; url: string | undefined; timeline: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{proj.name}</h3>
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
              {proj.timeline && <p className="text-sm text-gray-600 mb-2">{proj.timeline}</p>}
              {proj.description && <p className="text-gray-700">{proj.description}</p>}
            </div>
          )}
          renderEdit={(proj: { name: any; url: any; timeline: any; description: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <Input placeholder="Project Name" value={proj.name || ""} onChange={(v: any) => updateArrayItem("projects", i, { name: v })} className="mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <Input placeholder="URL" value={proj.url || ""} onChange={(v: any) => updateArrayItem("projects", i, { url: v })} />
                <Input placeholder="Timeline" value={proj.timeline || ""} onChange={(v: any) => updateArrayItem("projects", i, { timeline: v })} />
              </div>
              <Textarea
                placeholder="Description"
                value={proj.description || ""}
                onChange={(e) => updateArrayItem("projects", i, { description: e.target.value })}
                rows={3}
              />
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 mt-2" onClick={() => removeArrayItem("projects", i)}>
                <Trash2 size={16} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        />

        {/* Skills */}
        <Section
          icon={<Star className="text-yellow-600" size={28} />}
          title="Skills"
          items={displayProfile.skills}
          isEditing={isEditing}
          onAdd={() => addArrayItem("skills", { sector: "", skills: [] })}
          renderView={(skill: { sector: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; skills: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border-l-4 border-yellow-500 pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-2">{skill.sector}</h3>
              <div className="flex flex-wrap gap-2">
                {(skill.skills || []).map((s: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          renderEdit={(skill: { sector: any; skills: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <Input placeholder="Sector (e.g., Frontend Development)" value={skill.sector || ""} onChange={(v: any) => updateArrayItem("skills", i, { sector: v })} className="mb-2" />
              <Input
                placeholder="Skills (comma separated)"
                value={(skill.skills || []).join(", ")}
                onChange={(v: string) => updateArrayItem("skills", i, { skills: v.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                className="mb-2"
              />
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeArrayItem("skills", i)}>
                <Trash2 size={16} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        />

        {/* Certifications */}
        <Section
          icon={<Award className="text-indigo-600" size={28} />}
          title="Certifications"
          items={displayProfile.certifications}
          isEditing={isEditing}
          onAdd={() => addArrayItem("certifications", { name: "", issuer: "", date: "", link: "" })}
          renderView={(cert: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; issuer: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; date: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; link: string | undefined; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{cert.name}</h3>
                  {cert.issuer && <p className="text-gray-700 text-sm">{cert.issuer}</p>}
                  {cert.date && <p className="text-gray-600 text-xs mt-1">{cert.date}</p>}
                </div>
                {cert.link && (
                  <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          )}
          renderEdit={(cert: { name: any; issuer: any; date: any; link: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <Input placeholder="Certification Name" value={cert.name || ""} onChange={(v: any) => updateArrayItem("certifications", i, { name: v })} className="mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <Input placeholder="Issuer" value={cert.issuer || ""} onChange={(v: any) => updateArrayItem("certifications", i, { issuer: v })} />
                <Input placeholder="Date" value={cert.date || ""} onChange={(v: any) => updateArrayItem("certifications", i, { date: v })} />
                <Input placeholder="Certificate URL" value={cert.link || ""} onChange={(v: any) => updateArrayItem("certifications", i, { link: v })} />
              </div>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeArrayItem("certifications", i)}>
                <Trash2 size={16} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        />

        {/* Achievements */}
        <Section
          icon={<Award className="text-orange-600" size={28} />}
          title="Achievements"
          items={displayProfile.achievements}
          isEditing={isEditing}
          onAdd={() => addArrayItem("achievements", { title: "", description: "" })}
          renderView={(ach: { title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
            <div key={i} className="border-l-4 border-orange-500 pl-4 py-2">
              <h3 className="font-bold text-gray-900">{ach.title}</h3>
              {ach.description && <p className="text-gray-700 mt-1">{ach.description}</p>}
            </div>
          )}
          renderEdit={(ach: { title: any; description: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <Input placeholder="Achievement Title" value={ach.title || ""} onChange={(v: any) => updateArrayItem("achievements", i, { title: v })} className="mb-2" />
              <Textarea
                placeholder="Description"
                value={ach.description || ""}
                onChange={(e) => updateArrayItem("achievements", i, { description: e.target.value })}
                rows={2}
              />
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 mt-2" onClick={() => removeArrayItem("achievements", i)}>
                <Trash2 size={16} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        />
        
        {/* Custom Sections */}
        <Section
          icon={<Star className="text-pink-600" size={28} />}
          title="Additional Information"
          items={displayProfile.customSections}
          isEditing={isEditing}
          onAdd={() => addArrayItem("customSections", { title: "", body: {} })}
          renderView={(section: { title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; body: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{section.title}</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {JSON.stringify(section.body, null, 2)}
              </pre>
            </div>
          )}
          renderEdit={(section: { title: any; body: any; }, i: React.Key | null | undefined) => (
            <div key={i} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
              <Input placeholder="Section Title" value={section.title || ""} onChange={(v: any) => updateArrayItem("customSections", i, { title: v })} className="mb-2" />
              <Textarea
                placeholder='Body as JSON (e.g., {"field": "value"})'
                value={JSON.stringify(section.body || {})}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || "{}");
                    updateArrayItem("customSections", i, { body: parsed });
                    setError(null);
                  } catch {
                    setError("Invalid JSON in custom section");
                  }
                }}
                className="font-mono"
                rows={3}
              />
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 mt-2" onClick={() => removeArrayItem("customSections", i)}>
                <Trash2 size={16} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS (Refactored with Shadcn) ---

// Input helper (now uses ShadcnInput)
function Input({ icon, placeholder, value, onChange, type = "text", className = "" }: any) {
  return (
    <div className={cn("relative", className)}>
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <ShadcnInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)} // Passes the value up, not the event
        className={cn("w-full", icon ? 'pl-10' : '')}
      />
    </div>
  );
}

// ContactItem helper (now uses ShadcnButton)
function ContactItem({ icon, label, value, link }: any) {
  return (
    <Button variant="outline" asChild className="justify-start gap-3 h-auto p-3 text-left">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <div className="text-blue-600">{icon}</div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-sm text-gray-900 truncate">{value}</p>
        </div>
        <ExternalLink size={16} className="text-gray-400" />
      </a>
    </Button>
  );
}

// Section helper (now uses ShadcnCard and Button)
function Section({ icon, title, items, isEditing, onAdd, renderView, renderEdit }: any) {
  if (!isEditing && items.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            {icon}
            {title}
          </div>
          {isEditing && (
            <Button onClick={onAdd} size="sm">
              <Plus size={18} className="mr-2" />
              Add
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 && isEditing ? (
          <p className="text-gray-500 text-center py-8">No {title.toLowerCase()} added yet. Click "Add" to get started.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item: any, i: number) =>
              isEditing ? renderEdit(item, i) : renderView(item, i)
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}