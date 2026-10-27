import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import WelcomeAnimation from './components/WelcomeAnimation';

export const metadata: Metadata = {
  title: {
    default: "CareerConnect | Find work that moves you forward",
    template: "%s | CareerConnect",
  },
  description:
    "Explore internships and career opportunities, save promising roles, and connect your next move with CareerConnect.",
  applicationName: "CareerConnect",
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <WelcomeAnimation />
      </body>
    </html>
  );
}
