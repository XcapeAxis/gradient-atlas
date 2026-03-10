import type { Metadata } from "next";
import "@xyflow/react/dist/style.css";
import "@/app/globals.css";
import { LearningProgressBootstrap } from "@/components/providers/learning-progress-bootstrap";
import { MotionProvider } from "@/components/providers/motion-provider";

export const metadata: Metadata = {
  title: "Gradient Atlas",
  description:
    "Gradient Atlas is a calm, graph-first learning app for machine learning fundamentals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <LearningProgressBootstrap />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
