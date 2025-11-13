export default function SimpleTestPage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Simple Test Page - No Route Groups
      </h1>
      <p>If you can see this, basic Next.js routing works.</p>
      <p>The issue is specifically with the (dashboard) route group.</p>
    </div>
  );
}
