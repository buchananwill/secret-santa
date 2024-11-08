import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "@mantine/core/styles.css";
import "./globals.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import { isSignedIn } from "@/utils/supabase/is-signed-in-action-ssr";
import NavDrawer from "@/components/navigation/nav-drawer";
import { LinkTree, root } from "@/components/navigation/nav-tree";

const defaultUrl = process.env.ROOT_URL
  ? `${process.env.ROOT_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await isSignedIn();
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <head>
        <title>Secret Santa</title>
        <ColorSchemeScript />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MantineProvider theme={theme}>
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col gap-20 items-center">
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                  <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                    <div className="flex gap-5 items-center font-semibold">
                      <NavDrawer signedIn={!!user}>
                        <LinkTree navNode={root} path={""} />
                      </NavDrawer>
                    </div>
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </nav>
                <div className="flex flex-col gap-20 max-w-5xl p-5">
                  {children}
                </div>

                <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                  <p>
                    Powered by{" "}
                    <a
                      href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                      target="_blank"
                      className="font-bold hover:underline"
                      rel="noreferrer"
                    >
                      Supabase
                    </a>
                  </p>
                  <ThemeSwitcher />
                </footer>
              </div>
            </main>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

const theme = createTheme({
  defaultRadius: "lg",
  components: {
    Card: {
      defaultProps: { shadow: "md" },
    },
    Popover: {
      defaultProps: { shadow: "md" },
    },
    Button: {
      defaultProps: { radius: "md" },
    },
  },
});
