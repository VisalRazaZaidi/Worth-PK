import "./globals.css";

export const metadata = {
  title: "Worth.pk — Know Your Market Value | Pakistan CS Career Tool",
  description:
    "Upload your resume and discover your market value in Pakistan's tech industry. Get salary predictions for Karachi, Lahore & Islamabad with AI-powered career analysis.",
  keywords: "Pakistan, CS, career, salary, resume, tech jobs, Karachi, Lahore, Islamabad, software engineer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
