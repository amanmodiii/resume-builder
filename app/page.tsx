"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth"; // Import the Session type
import React, { ReactNode } from "react";
import { LogIn, LogOut, ArrowRight, FileText, Sparkles, Rocket, ChevronRight } from "lucide-react";

// Shadcn UI Imports
import { cn } from "@/lib/utils"; // Make sure this path is correct for your project
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Main Landing Page Component ---

export default function LandingPage() {
  const { data: session } = useSession(); // Re-enabled this line

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      <Header
        session={session}
        onSignIn={() => signIn("google")} // Re-enabled Google Sign-In
        onSignOut={() => signOut()} // Re-enabled Sign-Out
      />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// --- Page Sections ---

interface HeaderProps {
  session: Session | null; // Use the imported Session type
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onSignIn, onSignOut }) => (
  <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
    <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      ResumeCraft
    </div>
    <div>
      {session ? (
        <div className="flex items-center gap-4">
          {session.user?.name && (
            <p className="text-sm text-gray-600 hidden sm:block">
              Welcome, {session.user.name}
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
          <Button size="sm" asChild>
            <a href="/profile">My Profile</a>
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={onSignIn}>
          <LogIn className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
      )}
    </div>
  </header>
);

const HeroSection = () => (
  <section className="py-24 md:py-32 text-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="container mx-auto px-6">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Job hunting is exhausting.
        </span>
      </h1>
      <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-8">
        Tailoring your resume for every application doesn't have to be.
      </p>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
        Stop spending hours trying to match keywords. Our AI-powered tool analyzes the job description and instantly crafts a perfectly tailored resume from your master profile.
      </p>
      <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg" asChild>
        <a href="/profile">
          Get Started for Free
          <ArrowRight className="w-5 h-5 ml-2" />
        </a>
      </Button>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-6">The old way is broken.</h2>
      <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
        You're a great candidate, but manual resume tailoring is slow, tedious, and prone to errors.
        You miss keywords, the formatting breaks, and you burn out.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<FileText className="w-10 h-10 text-blue-600" />}
          title="1. Build Your Master Profile"
          description="Add all your experiences, skills, and projects just once. This becomes your single source of truth."
        />
        <FeatureCard
          icon={<Sparkles className="w-10 h-10 text-purple-600" />}
          title="2. Paste the Job Description"
          description="Found a job you love? Just paste the description into our tool. Our AI gets to work instantly."
        />
        <FeatureCard
          icon={<Rocket className="w-10 h-10 text-green-600" />}
          title="3. Get a Tailored Resume"
          description="Receive a new resume, perfectly tailored to the job, in seconds. Apply with confidence and save hours."
        />
      </div>
    </div>
  </section>
);

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl border border-gray-100">
    <CardHeader className="items-center text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        {icon}
      </div>
      <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 text-center">{description}</p>
    </CardContent>
  </Card>
);

const CTASection = () => (
  <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
    <div className="container mx-auto px-6 text-center.">
      <h2 className="text-4xl font-bold mb-6">
        Ready to land your next job, faster?
      </h2>
      <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-12">
        Stop the resume grind. Start the interview grind.
      </p>
      <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg text-blue-700 font-bold shadow-lg" asChild>
        <a href="/profile">
          Try Now for Free
          <ChevronRight className="w-5 h-5 ml-2" />
        </a>
      </Button>
    </div>
  </section>
);

const Footer = () => (
  <footer className="w-full py-8 px-6 md:px-12 border-t border-gray-200 bg-white">
    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4">
      <p>&copy; {new Date().getFullYear()} ResumeCraft. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="#" className="hover:text-gray-900">Privacy Policy</a>
        <a href="#" className="hover:text-gray-900">Terms of Service</a>
      </div>
    </div>
  </footer>
);