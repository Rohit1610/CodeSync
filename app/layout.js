import Navbar from "@/components/Navbar";
import '@/assets/styles/globals.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GlobalProvider } from "@/context/GlobalContext";

export const metadata = {
  title: "CodeSync",
  description: "Create custom contests and more.",
};

export default function RootLayout({ children }) {
  return (
    <GlobalProvider>
      <AuthProvider>
      <html lang="en">
        <body>
          <Navbar/>
          {children}
          <Analytics/>
          <SpeedInsights/>
          <ToastContainer/>
          </body>
      </html>
      </AuthProvider>
    </GlobalProvider>
  );
}
