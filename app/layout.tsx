import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.MonacoEnvironment = {
                  getWorkerUrl: function (moduleId, label) {
                    if (label === 'json') {
                      return './monaco-editor/esm/vs/language/json/json.worker.js';
                    }
                    if (label === 'css' || label === 'scss' || label === 'less') {
                      return './monaco-editor/esm/vs/language/css/css.worker.js';
                    }
                    if (label === 'html' || label === 'handlebars' || label === 'razor') {
                      return './monaco-editor/esm/vs/language/html/html.worker.js';
                    }
                    if (label === 'typescript' || label === 'javascript') {
                      return './monaco-editor/esm/vs/language/typescript/ts.worker.js';
                    }
                    return './monaco-editor/esm/vs/editor/editor.worker.js';
                  }
                };
              }
            `,
          }}
        />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
