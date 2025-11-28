import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const rotatingTitles = [
  'Journalist',
  'Interviewer',
  'Podcaster',
  'Musician',
  'Vlogger',
  'Educator'
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const currentTitle = useMemo(() => rotatingTitles[index], [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingTitles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="hero__content">
        <header className="hero__header">
          <span className="logo-chip">Noise Reducer</span>
          <nav className="hero__nav">
            <a href="#features">Features</a>
            <a href="#learn">Learn</a>
             <Link className="btn-primary" to="/NoiseCleaner">
              Upload
            </Link>
            <Link className="btn-primary" to="/console">
              Try Live Demo
            </Link>
          </nav>
        </header>


        <div className="hero__visual">

          <div className="hero__body">
            <p className="hero__eyebrow">AI Audio Enhancer</p>
            <h1>
              Noise Reduction for&nbsp;<span className="hero__highlight">{currentTitle}</span>
            </h1>
            <p className="hero__description">
              Automatically remove background noise from audio and video feeds, and enhance the audio
              quality of your recordings with AI-powered suppression that runs directly in the browser.
            </p>
            <div className="hero__cta">
              <Link to="/console" className="btn-primary">
                Start For Free Online
              </Link>
              <button className="btn-pink">Noise Reduction For Desktop</button>
            </div>
          </div>

          <div className="hero__avatar" />
          {/* <div className="hero__wave">
            <svg width="560" height="80" viewBox="0 0 560 80" fill="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#58e0ff" />
                  <stop offset="50%" stopColor="#d67dff" />
                  <stop offset="100%" stopColor="#ff6da1" />
                </linearGradient>
              </defs>
              <path
                className="wave-path"
                d="M0 40 Q 40 0 80 40 T 160 40 T 240 40 T 320 40 T 400 40 T 480 40 T 560 40"
                stroke="url(#waveGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray="20 30"
              />
            </svg>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;

