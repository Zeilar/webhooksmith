import { SignIn } from "./(components)/sign-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Webhooksmith",
  description: "Sign in for access.",
  alternates: { canonical: "/forbidden" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <SignIn />;
}
