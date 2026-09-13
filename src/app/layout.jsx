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
      <body className="antialiased min-h-screen flex flex-col" style={{ background: '#0e1117', color: '#f0f2f8' }}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="mt-16 border-t py-8 text-center text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#161b27', color: '#4a5568' }}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div style={{ color: '#4a5568' }}>
                © September 2026 Ivy Homes Engineering Assessment · Chennai Scoped Dataset
              </div>
              <div className="flex items-center gap-4" style={{ color: '#4a5568' }}>
                <span>API: <code className="font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(108,99,255,0.12)', color: '#9b95ff' }}>solve.ivy.homes</code></span>
                <span style={{ color: '#2a3349' }}>•</span>
                <span>Ref: <code className="font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(108,99,255,0.12)', color: '#9b95ff' }}>2026-09-10T00:00:00+05:30</code></span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
