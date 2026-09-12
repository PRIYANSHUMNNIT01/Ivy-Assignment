import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Ivy Homes — Chennai Property Intelligence & Data Audit",
  description: "High-performance property exploration, rentals, builder projects, and comprehensive API documentation integrity audit for Chennai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                © September 2026 Ivy Homes Engineering Assessment · Chennai Scoped Dataset
              </div>
              <div className="flex items-center space-x-4 text-slate-400">
                <span>API: <code className="text-slate-600 font-mono">solve.ivy.homes</code></span>
                <span>•</span>
                <span>Ref: <code className="text-slate-600 font-mono">2026-09-10T00:00:00+05:30</code></span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
