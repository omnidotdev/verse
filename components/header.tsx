"use client";

import { Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Sprout className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Garden Schema Visualizer</h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground mt-2">
        Create, visualize, and manage Garden schemas for technology ecosystems
      </p>
    </header>
  );
}