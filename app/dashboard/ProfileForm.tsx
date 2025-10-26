"use client";

import React, { useEffect, useState } from "react";

type Role = {
  title?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
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
  skills: string[]; // stored as array but edited via comma input
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
  email?: string;
  contact: Contact;
  profilePictures: string[];
  education: Education[];
  projects: Project[];
  experiences: Experience[];
  certifications: string[];
  achievements: string[];
  skills: Skill[];
  customSections: CustomSection[];
};

const DEFAULT_PROFILE: Profile = {
  email: "",
  contact: {
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
  },
  profilePictures: [],
  education: [],
  projects: [],
  experiences: [],
  certifications: [],
  achievements: [],
  skills: [],
  customSections: [],
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch profile on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          // if 401 or not found, keep defaults
          if (res.status === 401) {
            setProfile((p) => ({ ...p }));
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }
        const data = await res.json();
        if (!mounted) return;
        if (!data || Object.keys(data).length === 0) {
          setProfile(DEFAULT_PROFILE);
        } else {
          // sanitize incoming profile to ensure all fields exist
          setProfile({
            email: data.email ?? "",
            contact: {
              email: data.contact?.email ?? "",
              phone: data.contact?.phone ?? "",
              website: data.contact?.website ?? "",
              linkedin: data.contact?.linkedin ?? "",
              github: data.contact?.github ?? "",
              twitter: data.contact?.twitter ?? "",
            },
            profilePictures: Array.isArray(data.profilePictures) ? data.profilePictures : [],
            education: Array.isArray(data.education) ? data.education : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            experiences: Array.isArray(data.experiences) ? data.experiences : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            achievements: Array.isArray(data.achievements) ? data.achievements : [],
            skills: Array.isArray(data.skills) ? data.skills : [],
            customSections: Array.isArray(data.customSections) ? data.customSections : [],
          });
        }
      } catch (err: any) {
        console.error(err);
        setError(String(err?.message ?? err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // helpers
  const setField = (path: string[], value: any) => {
    setProfile((prev) => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (cur[path[i]] === undefined) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return copy;
    });
  };

  // array helpers
  const pushArrayItem = (key: keyof Profile, item: any) =>
    setProfile((p) => ({ ...p, [key]: [...(p[key] as any[]), item] }));

  const removeArrayItem = (key: keyof Profile, index: number) =>
    setProfile((p) => {
      const arr = [...(p[key] as any[])];
      arr.splice(index, 1);
      return { ...p, [key]: arr };
    });

  const updateArrayItem = (key: keyof Profile, index: number, patch: any) =>
    setProfile((p) => {
      const arr = [...(p[key] as any[])];
      arr[index] = { ...arr[index], ...patch };
      return { ...p, [key]: arr };
    });

  // specialized helpers for roles within an experience
  const addRole = (expIndex: number) => {
    setProfile((p) => {
      const exps = [...p.experiences];
      if (!exps[expIndex]) exps[expIndex] = { company: "", roles: [] };
      exps[expIndex].roles = [...(exps[expIndex].roles || []), { title: "", startDate: "", endDate: "", description: "" }];
      return { ...p, experiences: exps };
    });
  };

  const updateRole = (expIndex: number, roleIndex: number, patch: Partial<Role>) => {
    setProfile((p) => {
      const exps = JSON.parse(JSON.stringify(p.experiences));
      exps[expIndex].roles[roleIndex] = { ...exps[expIndex].roles[roleIndex], ...patch };
      return { ...p, experiences: exps };
    });
  };

  const removeRole = (expIndex: number, roleIndex: number) => {
    setProfile((p) => {
      const exps = JSON.parse(JSON.stringify(p.experiences));
      exps[expIndex].roles.splice(roleIndex, 1);
      return { ...p, experiences: exps };
    });
  };

  // skills helper: skill.skills is array but we expose as comma input
  const setSkillSector = (idx: number, sector: string) => updateArrayItem("skills", idx, { sector });
  const setSkillList = (idx: number, commaText: string) =>
    updateArrayItem("skills", idx, { skills: commaText.split(",").map((s) => s.trim()).filter(Boolean) });

  // save
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Save failed ${res.status}`);
      }
      const data = await res.json();
      setProfile((p) => ({ ...p, ...data }));
      alert("Saved.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your profile? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProfile(DEFAULT_PROFILE);
      alert("Profile deleted.");
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <section className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={profile.contact.email ?? ""}
            onChange={(e) => setField(["contact", "email"], e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Phone"
            value={profile.contact.phone ?? ""}
            onChange={(e) => setField(["contact", "phone"], e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Website"
            value={profile.contact.website ?? ""}
            onChange={(e) => setField(["contact", "website"], e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="LinkedIn"
            value={profile.contact.linkedin ?? ""}
            onChange={(e) => setField(["contact", "linkedin"], e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="GitHub"
            value={profile.contact.github ?? ""}
            onChange={(e) => setField(["contact", "github"], e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Twitter"
            value={profile.contact.twitter ?? ""}
            onChange={(e) => setField(["contact", "twitter"], e.target.value)}
          />
        </div>
      </section>

      {/* Education */}
      <section className="bg-white p-4 rounded shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Education</h3>
          <button
            onClick={() => pushArrayItem("education", { school: "", stream: "", yearOfPassing: "", grade: "" })}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>
        {profile.education.length === 0 && <p className="text-sm text-gray-500">No education entries yet.</p>}
        <div className="space-y-3">
          {profile.education.map((edu, i) => (
            <div key={i} className="border p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  className="border p-2 rounded"
                  placeholder="School"
                  value={edu.school ?? ""}
                  onChange={(e) => updateArrayItem("education", i, { ...edu, school: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Stream"
                  value={edu.stream ?? ""}
                  onChange={(e) => updateArrayItem("education", i, { ...edu, stream: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Year of Passing"
                  value={edu.yearOfPassing ?? ""}
                  onChange={(e) =>
                    updateArrayItem("education", i, { ...edu, yearOfPassing: e.target.value ? Number(e.target.value) : "" })
                  }
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Grade / % / GPA"
                  value={edu.grade ?? ""}
                  onChange={(e) => updateArrayItem("education", i, { ...edu, grade: e.target.value })}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => removeArrayItem("education", i)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="bg-white p-4 rounded shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Projects</h3>
          <button
            onClick={() => pushArrayItem("projects", { name: "", url: "", timeline: "", description: "" })}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>

        {profile.projects.length === 0 && <p className="text-sm text-gray-500">No projects yet.</p>}
        <div className="space-y-3">
          {profile.projects.map((proj, i) => (
            <div key={i} className="border p-3 rounded">
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Project name"
                value={proj.name ?? ""}
                onChange={(e) => updateArrayItem("projects", i, { ...proj, name: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  className="border p-2 rounded"
                  placeholder="URL"
                  value={proj.url ?? ""}
                  onChange={(e) => updateArrayItem("projects", i, { ...proj, url: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Timeline"
                  value={proj.timeline ?? ""}
                  onChange={(e) => updateArrayItem("projects", i, { ...proj, timeline: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Description"
                  value={proj.description ?? ""}
                  onChange={(e) => updateArrayItem("projects", i, { ...proj, description: e.target.value })}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => removeArrayItem("projects", i)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section className="bg-white p-4 rounded shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Experiences</h3>
          <button
            onClick={() => pushArrayItem("experiences", { company: "", roles: [] })}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Add Company
          </button>
        </div>

        {profile.experiences.length === 0 && <p className="text-sm text-gray-500">No experiences yet.</p>}
        <div className="space-y-3">
          {profile.experiences.map((exp, i) => (
            <div key={i} className="border p-3 rounded">
              <div className="flex items-center justify-between">
                <input
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Company"
                  value={exp.company ?? ""}
                  onChange={(e) => updateArrayItem("experiences", i, { ...exp, company: e.target.value })}
                />
                <button onClick={() => removeArrayItem("experiences", i)} className="ml-3 bg-red-500 text-white px-3 py-1 rounded text-sm">
                  Remove Company
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Roles</h4>
                  <button onClick={() => addRole(i)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                    Add Role
                  </button>
                </div>

                {(exp.roles || []).map((role, rIdx) => (
                  <div key={rIdx} className="border p-2 rounded">
                    <input
                      className="border p-2 rounded w-full mb-2"
                      placeholder="Title"
                      value={role.title ?? ""}
                      onChange={(e) => updateRole(i, rIdx, { title: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <input
                        className="border p-2 rounded"
                        placeholder="Start date (YYYY-MM-DD)"
                        value={role.startDate ?? ""}
                        onChange={(e) => updateRole(i, rIdx, { startDate: e.target.value })}
                      />
                      <input
                        className="border p-2 rounded"
                        placeholder="End date (YYYY-MM-DD or 'Present')"
                        value={role.endDate ?? ""}
                        onChange={(e) => updateRole(i, rIdx, { endDate: e.target.value })}
                      />
                    </div>
                    <textarea
                      className="border p-2 rounded w-full"
                      placeholder="Description"
                      value={role.description ?? ""}
                      onChange={(e) => updateRole(i, rIdx, { description: e.target.value })}
                    />
                    <div className="mt-2">
                      <button onClick={() => removeRole(i, rIdx)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                        Remove Role
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white p-4 rounded shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Skills</h3>
          <button onClick={() => pushArrayItem("skills", { sector: "", skills: [] })} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add Sector</button>
        </div>

        {profile.skills.length === 0 && <p className="text-sm text-gray-500">No skills yet.</p>}
        <div className="space-y-3">
          {profile.skills.map((sk, i) => (
            <div key={i} className="border p-3 rounded">
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Sector (e.g., Frontend)"
                value={sk.sector ?? ""}
                onChange={(e) => setSkillSector(i, e.target.value)}
              />
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Skills (comma separated)"
                value={(sk.skills || []).join(", ")}
                onChange={(e) => setSkillList(i, e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => removeArrayItem("skills", i)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                  Remove Sector
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Sections */}
      <section className="bg-white p-4 rounded shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Custom Sections</h3>
          <button onClick={() => pushArrayItem("customSections", { title: "", body: {} })} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add Section</button>
        </div>

        {profile.customSections.length === 0 && <p className="text-sm text-gray-500">No custom sections yet.</p>}
        <div className="space-y-3">
          {profile.customSections.map((cs, i) => (
            <div key={i} className="border p-3 rounded">
              <input
                className="border p-2 rounded w-full mb-2"
                placeholder="Title"
                value={cs.title ?? ""}
                onChange={(e) => updateArrayItem("customSections", i, { ...cs, title: e.target.value })}
              />
              <textarea
                className="border p-2 rounded w-full mb-2"
                placeholder='Body as JSON (e.g., {"org":"X","role":"Y"})'
                value={JSON.stringify(cs.body ?? {})}
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                    updateArrayItem("customSections", i, { ...cs, body: parsed });
                    setError(null);
                  } catch (err) {
                    setError("Invalid JSON in custom section body. Please correct it.");
                  }
                }}
              />
              <div className="flex gap-2">
                <button onClick={() => removeArrayItem("customSections", i)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
                  Remove Section
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications & Achievements simple list editors */}
      <section className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Certifications</h3>
        <div className="space-y-2">
          {profile.certifications.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input className="border p-2 rounded w-full" value={c ?? ""} onChange={(e) => updateArrayItem("certifications", i, e.target.value)} />
              <button onClick={() => removeArrayItem("certifications", i)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Remove</button>
            </div>
          ))}
          <button onClick={() => pushArrayItem("certifications", "")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add Certification</button>
        </div>

        <h3 className="text-lg font-semibold mt-4 mb-2">Achievements</h3>
        <div className="space-y-2">
          {profile.achievements.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input className="border p-2 rounded w-full" value={a ?? ""} onChange={(e) => updateArrayItem("achievements", i, e.target.value)} />
              <button onClick={() => removeArrayItem("achievements", i)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Remove</button>
            </div>
          ))}
          <button onClick={() => pushArrayItem("achievements", "")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add Achievement</button>
        </div>
      </section>

      {/* Save / Delete */}
      <div className="flex gap-3 items-center">
        <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded">
          {saving ? "Saving..." : "Save Profile"}
        </button>
        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete Profile
        </button>
      </div>
    </div>
  );
}
