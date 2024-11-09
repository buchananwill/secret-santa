import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import { isSignedIn } from "@/utils/supabase/is-signed-in-action-ssr";
import NavDrawer from "@/components/navigation/nav-drawer";
import { LinkTree, root } from "@/components/navigation/nav-tree";
import { Notifications } from "@mantine/notifications";

const defaultUrl = process.env.ROOT_URL
  ? `${process.env.ROOT_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Elfville Secret Santa Matcher",
  description: "For elves who love a bit of mystery with their present giving.",
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
            <Notifications />
            <main className="min-h-screen flex flex-col items-center w-full max-w-full">
              <div className="flex-1 w-full flex flex-col gap-4 items-center">
                <nav className="w-full flex justify-around border-b border-b-foreground/10 h-16 sticky top-0 z-20 backdrop-blur items-center gap-2 max-w-full">
                  <NavDrawer signedIn={!!user}>
                    {user && (
                      <div className={"truncate max-w-full pb-2 border-b"}>
                        Hey, {user.email}!
                      </div>
                    )}
                    <LinkTree navNode={root} path={""} />
                  </NavDrawer>

                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </nav>
                <div className="flex flex-col gap-2 max-w-full md:max-w-5xl md:p-5">
                  {children}
                </div>

                <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
                  <p>
                    Powered by{" "}
                    <a
                      href={"https://en.wikipedia.org/wiki/Elf_(film)"}
                      className={"font-bold"}
                    >
                      Elves
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
    Paper: {
      defaultProps: { shadow: "md" },
    },
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
