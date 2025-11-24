import Dashboard from "./Dashboard";

const ConsolePage = () => {
  return (
    <div className="consolePage">
      <section id="console" className="section" style={{ paddingTop: "4rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <span className="pill">Hands-on Demo</span>
          <h2 style={{ marginTop: "0.75rem", marginBottom: "0.25rem" }}>
            Live Noise Console
          </h2>
          <p style={{ color: "#b6b9d6" }}>
            Spin up the real-time pipeline below, stream audio from your phone,
            and listen to the cleaned output in your browser.
          </p>
        </div>
        <Dashboard />
      </section>
    </div>
  );
};

export default ConsolePage;
