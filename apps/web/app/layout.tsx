import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { Providers } from "./providers";
import { SignIn } from "./sign-in";
import { getUser } from "@/api/server/user";
import classNames from "classnames";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Webhooksmith",
  description: "Take control of your services' webhooks.",
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const user = await getUser();

  return (
    <html className={classNames("dark", inter.variable, "antialiased")} lang="en">
      <body>
        <div className="flex">
          <Providers user={user} socketUrl={process.env.SOCKET_URL}>
            {user && <Sidebar logoutUrl={`${process.env.API_URL}/v1/auth/logout`} />}
            {user ? children : <SignIn />}
          </Providers>
        </div>
      </body>
    </html>
  );
}
