import { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import type { Profile, Skills, Interest } from "../../lib/types";
import { cn } from "../../lib/cn";

interface AppLayoutProps {
  profile: Profile;
  skills: Skills;
  interests: Interest[];
  children: React.ReactNode;
}

export function AppLayout({ profile, skills, interests, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 bg-[var(--color-bg)]",
          "transform transition-transform duration-200 ease-in-out",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar profile={profile} skills={skills} interests={interests} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-[var(--color-text-muted)] hover:text-white"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium">{profile.name}</span>
        </div>

        {children}
      </div>
    </div>
  );
}
