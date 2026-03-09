import { LandingCanvas } from "@/components/home/landing-canvas";
import { HomeProgressPanel } from "@/components/home/home-progress-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell
      center={<LandingCanvas />}
      currentSection="home"
      description="Gradient Atlas pairs a calm local-first shell with a deterministic ML fundamentals curriculum pack designed for focused study and extension."
      rightPanel={<HomeProgressPanel />}
      title="A calm graph workspace for machine learning fundamentals"
    />
  );
}
