import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";
import { PosthogProvider } from "../components/PosthogProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://geo.canada.nshipyard.com"),
  title: "Toronto Geo Concordances — every neighbourhood boundary, joined across census years",
  description:
    "The canonical crosswalk between Toronto's 140 and 158 neighbourhood models, plus ward concordances. Explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
  openGraph: {
    title: "Toronto Geo Concordances — every neighbourhood boundary, joined across census years",
    description:
      "The canonical crosswalk between Toronto's 140 and 158 neighbourhood models, plus ward concordances. Explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
    url: "https://geo.canada.nshipyard.com",
    siteName: "Toronto Geo Concordances",
    images: [{ url: "/og-image.png", width: 1200, height: 750, alt: "Toronto Geo Concordances — neighbourhood boundary crosswalk" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toronto Geo Concordances — every neighbourhood boundary, joined across census years",
    description:
      "The canonical crosswalk between Toronto's 140 and 158 neighbourhood models, plus ward concordances. Explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      "/favicon.ico",
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col"><PosthogProvider>
        <LangProvider>{children}</LangProvider>
      </PosthogProvider></body>
    </html>
  );
}
