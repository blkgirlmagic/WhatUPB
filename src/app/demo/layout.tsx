export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f0eaff" }}>
        {children}
      </body>
    </html>
  );
}
