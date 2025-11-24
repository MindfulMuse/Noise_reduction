const footerLinks = [
  {
    title: 'Real-time Suite',
    links: [
      { label: 'Noise Reduction Console', href: '#console' },
      { label: 'Waveform Visualizer', href: '#console' },
      { label: 'RNNoise Pipeline', href: '#how-it-works' },
      { label: 'Live Monitoring', href: '#console' }
    ]
  },
  {
    title: 'Capture & Streaming',
    links: [
      { label: 'Phone → Browser Bridge', href: '#how-it-works' },
      { label: 'WebRTC Toolkit', href: '#how-it-works' },
      { label: 'USB & Line-in Capture', href: '#features' },
      { label: 'Edge Signaling Server', href: '/server-docs' }
    ]
  },
  {
    title: 'Processing Engines',
    links: [
      { label: 'AudioWorklet Graph', href: '#how-it-works' },
      { label: 'ScriptProcessor Fallback', href: '#stack' },
      { label: 'RNNoise WASM', href: '#stack' },
      { label: 'Custom DSP Modules', href: '#stack' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Architecture Notes', href: '#learn' },
      { label: 'Setup Guide', href: '/docs/setup' },
      { label: 'Testing with Phone Source', href: '/docs/phone' },
      { label: 'Changelog', href: '/docs/changelog' }
    ]
  }
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="logo-chip">Noise Cleaner</div>
          <p>Browser-native DSP that keeps live audio pristine anywhere.</p>

          <div>
            <p className="site-footer__follow">Follow us</p>
            <div className="site-footer__socials">
              <a href="https://github.com/your-repo" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://twitter.com/your-handle" target="_blank" rel="noreferrer">
                Twitter
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="site-footer__grid">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="site-footer__meta">
        <p>© {new Date().getFullYear()} Noise Cleaner · Real-time AI noise reduction in your browser.</p>
        <div className="site-footer__links">
          <a href="/privacy">Privacy</a>
          <a href="/cookies">Cookies</a>
          <a href="/terms">Terms</a>
          <a href="/support">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

