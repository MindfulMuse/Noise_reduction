import Hero from "../components/Hero";
import UseCasesSection from "../components/UseCasesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";

const HomePage = () => {
  const howItWorks = [
    {
      title: "Capture",
      body: "Audio is captured from the microphone on the sender device (phone or laptop) and converted into raw PCM chunks. These chunks are streamed instantly to the Python backend via a low-latency WebSocket connection.",
    },
    {
      title: "Process",
      body: "The server receives the noisy stream and passes it through DeepFilterNet, a PyTorch-based deep learning model. This neural network intelligently separates human speech from complex background noise on the server’s GPU or CPU.",
    },
    {
      title: "Output",
      body: 'The enhanced, clean audio is broadcasted immediately to connected "Receiver" clients via WebSockets, allowing them to play back the clarified speech in real-time.',
    },
  ];

  return (
    <div className="HomePage_">
      <Hero />
      <UseCasesSection />
      <TestimonialsSection />
      <FAQSection />

      {/* <section className="section" id="about">
        <h2>About the Project</h2>
        <p>
          Noise Cleaner transforms any browser into a low-latency DSP workstation. It exists for
          teams who need portable, secure cleanup of live audio without installing native software.
          The system strips background noise, keeping speech intelligible for comms, content
          creation, or live monitoring.
        </p>
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <strong>Problem solved:</strong> Mobile reporters, remote crews, and makers often capture
          audio in noisy environments. Shipping recordings off-device adds delay and privacy risk.
          Noise Cleaner keeps the pipeline on-device, in the browser, with deterministic latency.
        </div>
      </section> */}

      <section className="section" id="how-it-works">
        <h2>How It Works</h2>
        <div className="section-grid">
          {howItWorks.map((item) => (
            <div key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: "1.25rem" }}>
          Phone → Server → Laptop: The phone captures the microphone and streams
          raw audio to the backend via WebSockets. The server feeds the stream
          into the DeepFilterNet model for noise suppression, then broadcasts
          the clean signal to the laptop for immediate playback.
        </div>
      </section>

      {/* <section className="section" id="stack">
        <h2>Technology Stack</h2>
        <div className="section-grid">
          {techStack.map((stack) => (
            <div key={stack.title} className="card">
              <h3>{stack.title}</h3>
              <p>{stack.body}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* <section className="section" id="features">
        <h2>Features</h2>
        <div className="card">
          <ul style={{ paddingLeft: '1.25rem', color: '#c7c9e6', lineHeight: 1.8 }}>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </section> */}

      {/* <section className="section" id="learn">
        <h2>Behind the Scenes</h2>
        <div className="section-grid">
          {behindScenes.map((item) => (
            <div key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section> */}

      <Footer />
    </div>
  );
};

export default HomePage;
