"use client";

import { useState } from "react";
import { GardenSpec, sampleGarden } from "@/lib/schema/garden";
import { Header } from "@/components/header";
import { GardenTabs } from "@/components/garden-tabs";

export default function Visualizer() {
  const [garden, setGarden] = useState<GardenSpec>(sampleGarden);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Header />
        <GardenTabs garden={garden} onSchemaChange={setGarden} />
      </div>
    </main>
  );
}