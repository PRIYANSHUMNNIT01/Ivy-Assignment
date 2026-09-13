import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Ivy Homes — Chennai Property Intelligence & Data Audit",
  description: "Browse Chennai properties, rentals, and builder projects.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#fafaf8', color: '#1c1917', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 20px' }}>
            {children}
          </main>
          <footer style={{ borderTop: '1px solid #e8e3dc', background: '#fff', padding: '28px 20px', marginTop: '48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: '#78716c' }}>
                © 2026 Ivy Homes · Chennai Dataset · Assessment Submission
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: 13, color: '#a8a29e' }}>
                <span>API: <code style={{ fontFamily: 'monospace', color: '#78716c' }}>solve.ivy.homes</code></span>
                <span>Ref: <code style={{ fontFamily: 'monospace', color: '#78716c' }}>2026-09-10T00:00:00+05:30</code></span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
