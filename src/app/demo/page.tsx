export const metadata = {
  title: "CoinRep — Say What You Really Think",
  description: "Anonymous messages. No account needed. Share your link publicly.",
};

export default function DemoPage() {
  return (
    <iframe
      src="/demo-static.html"
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
      }}
      title="CoinRep Demo"
    />
  );
}
