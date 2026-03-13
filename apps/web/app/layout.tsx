import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import { Navbar } from "./(components)/navbar";
import { Footer } from "./(components)/footer";
import { Providers } from "./(components)/providers";
import { SignIn } from "./(components)/sign-in";
import { getUser } from "@/api/server/user";
import classNames from "classnames";
import { getDbHealth } from "@/api/server/db";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

const siteTitle = "Webhooksmith";
const siteDescription = "Take control of your services' webhooks.";
const ogImagePath = "/webhooksmith.png";

function getMetadataBase(): URL | null {
  try {
    return new URL(process.env.WEB_URL);
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: siteTitle,
  description: siteDescription,
  applicationName: siteTitle,
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: ogImagePath, type: "image/png" }],
    shortcut: [ogImagePath],
    apple: [{ url: ogImagePath, type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    url: "/",
    images: [{ url: ogImagePath, alt: siteTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImagePath],
  },
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const isDbOk = await getDbHealth();
  if (!isDbOk) {
    throw new Error("Database is unavailable.");
  }
  const user = await getUser();

  return (
    <html className={classNames("dark", inter.variable, "antialiased")} lang="en">
      <body>
        <Providers apiUrl={process.env.API_URL} user={user} socketUrl={process.env.SOCKET_URL}>
          {user && <Navbar />}
          {user ? children : <SignIn />}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
