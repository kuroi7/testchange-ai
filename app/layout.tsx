import "./globals.css";

export const metadata = {
  title: "TestChange AI",
  description: "Change-aware QA agent for test case maintenance",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
