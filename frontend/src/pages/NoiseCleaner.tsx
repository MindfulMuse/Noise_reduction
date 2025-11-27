// // E:\tp\random\frontend\src\pages\NoiseCleaner.tsx

// import { useState } from "react";

// export default function NoiseCleaner() {
//   const [file, setFile] = useState<File | null>(null);
//   const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function uploadFile() {
//     if (!file) return;

//     setLoading(true);
//     setCleanedUrl(null);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("http://localhost:8080/process", {
//         method: "POST",
//         body: formData
//       });

//       if (!res.ok) {
//         alert("❌ Server error");
//         return;
//       }

//       const blob = await res.blob();
//       setCleanedUrl(URL.createObjectURL(blob));
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to connect to server");
//     }

//     setLoading(false);
//   }

//   return (
//     <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
//       <h2>🎧 DeepFilterNet - Noise Cleaner</h2>

//       <input
//         type="file"
//         accept="audio/wav,audio/mp3,audio/flac"
//         onChange={(e) => setFile(e.target.files?.[0] || null)}
//       />

//       <button
//         onClick={uploadFile}
//         disabled={!file || loading}
//         style={{
//           marginTop: 20,
//           padding: "10px 20px",
//           background: "#4b7bec",
//           color: "white",
//           border: "none",
//           borderRadius: 6,
//           cursor: "pointer"
//         }}
//       >
//         {loading ? "Processing..." : "Upload & Clean"}
//       </button>

//       {cleanedUrl && (
//         <div style={{ marginTop: 30 }}>
//           <h3>Cleaned Audio</h3>

//           <audio controls src={cleanedUrl}></audio>

//           <br />
//           <a
//             href={cleanedUrl}
//             download="cleaned.wav"
//             style={{ marginTop: 10, display: "inline-block" }}
//           >
//             ⬇️ Download Cleaned File
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";

export default function NoiseCleanerUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [noisyUrl, setNoisyUrl] = useState<string | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleProcess() {
    if (!file) return;

    setLoading(true);
    setCleanedUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    // store noisy version for preview
    setNoisyUrl(URL.createObjectURL(file));

    try {
      const res = await fetch("http://localhost:8080/process", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("❌ Server error while cleaning.");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      setCleanedUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("❌ Could not connect to backend.");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "780px",
          display: "grid",
          gap: "1.5rem",
        }}
      >
        {/* Header */}
        <header style={{ textAlign: "center" }}>
          <p className="pill">Noise Reduction</p>
          <h1 style={{ marginTop: "0.75rem", marginBottom: "0.35rem" }}>
            Noise Cleaner
          </h1>
          <p style={{ color: "#9da6ff", maxWidth: "620px", margin: "0 auto" }}>
            Upload an audio file to remove background noise using DeepFilterNet.
            Perfect for speech restoration demos.
          </p>
        </header>

        {/* Upload Card */}
        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>🔊 Upload Audio</h3>

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setCleanedUrl(null);
              setNoisyUrl(null);
            }}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "6px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          />

          {file && (
            <p style={{ marginTop: "0.8rem", color: "#9da6ff" }}>
              Selected: <strong>{file.name}</strong>
            </p>
          )}

          <button
            onClick={handleProcess}
            disabled={!file || loading}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.2rem",
              background: "#4b7bec",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: !file ? "not-allowed" : "pointer",
              fontSize: "1rem",
              opacity: !file ? 0.5 : 1,
            }}
          >
            {loading ? "⏳ Cleaning..." : "✨ Clean Audio"}
          </button>
        </div>

        {/* A/B Comparison Section */}
        {(noisyUrl || cleanedUrl) && (
          <div
            className="card"
            style={{
              padding: "1.5rem",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>🎧 Compare Noisy vs Clean</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.2rem",
              }}
            >
              {/* Noisy Audio */}
              <div>
                <p
                  style={{
                    marginBottom: "0.4rem",
                    color: "#9da6ff",
                    fontWeight: 600,
                  }}
                >
                  Noisy Input
                </p>
                {noisyUrl ? (
                  <audio controls src={noisyUrl} style={{ width: "100%" }} />
                ) : (
                  <p style={{ color: "#666" }}>No file uploaded yet</p>
                )}
              </div>

              {/* Clean Audio */}
              <div>
                <p
                  style={{
                    marginBottom: "0.4rem",
                    color: "#9da6ff",
                    fontWeight: 600,
                  }}
                >
                  Cleaned Output
                </p>
                {cleanedUrl ? (
                  <audio controls src={cleanedUrl} style={{ width: "100%" }} />
                ) : (
                  <p style={{ color: "#666" }}>Process audio to show output</p>
                )}
              </div>
            </div>

            {cleanedUrl && (
              <a
                href={cleanedUrl}
                download="cleaned.wav"
                style={{
                  display: "inline-block",
                  marginTop: "1.2rem",
                  padding: "0.75rem 1.2rem",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              >
                ⬇️ Download Cleaned Audio
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
