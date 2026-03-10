import { LandingCanvas } from "@/components/home/landing-canvas";
import { HomeProgressPanel } from "@/components/home/home-progress-panel";
import { TopBar } from "@/components/layout/top-bar";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <a
        className="sr-only left-4 top-4 z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-soft focus:not-sr-only focus:absolute"
        href="#main-content"
      >
        Skip to content
      </a>

      <TopBar currentSection="home" />

      <main
        className="mx-auto grid max-w-[1480px] gap-8 px-5 pb-12 pt-10 xl:grid-cols-[minmax(0,1fr),320px]"
        id="main-content"
      >
        <LandingCanvas />
        <HomeProgressPanel />
      </main>
    </div>
  );
}
