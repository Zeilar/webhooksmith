import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { Providers } from "./providers";
import { SignIn } from "./sign-in";
import { getUser } from "@/api/server/user";
import classNames from "classnames";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webhooksmith",
  description: "Take control of your services' webhooks.",
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const user = await getUser();

  return (
    <html className={classNames("dark", geistSans.className, geistMono.className, "antialiased")} lang="en">
      <body>
        <div className="flex">
          <Providers user={user}>
            {user && <Sidebar logoutUrl={`${process.env.API_URL}/v1/auth/logout`} />}
            {user ? children : <SignIn />}
          </Providers>
        </div>
      </body>
    </html>
  );
}
