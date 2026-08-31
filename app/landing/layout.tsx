import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scramble — Marketing Intelligence, Automated",
  description:
    "Scramble connects your Search Console, Analytics, and Google Ads into one elegant dashboard with automated insights delivered every morning.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
