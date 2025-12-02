const footerLinks = [
  {
    title: 'Real-time Suite',
    links: [
      { label: 'Noise Reduction Console', href: '#console' },
      { label: 'Waveform Visualizer', href: '#console' }, // laptop.py visualizes waveforms
      { label: 'DeepFilterNet Pipeline', href: '#how-it-works' }, // server.py uses DeepFilterNet
      { label: 'Live Monitoring', href: '#console' }
    ]
  },
  {
    title: 'Capture & Streaming',
    links: [
      { label: 'Mobile Sender', href: '#how-it-works' }, // sender.py handles mobile/mic input
      { label: 'WebSocket Protocol', href: '#how-it-works' }, // server.py uses aiohttp WebSockets
      { label: 'Microphone Capture', href: '#features' }, // sender.py captures raw audio
      { label: 'Python Inference Server', href: '/server-docs' } // server.py runs the inference
    ]
  },
  {
    title: 'Processing Engines',
    links: [
      { label: 'PyTorch Backend', href: '#how-it-works' }, // server.py imports torch
      { label: 'CUDA Acceleration', href: '#stack' }, // server.py checks for cuda availability
      { label: 'DeepFilterNet Model', href: '#stack' }, // server.py loads init_df
      { label: '3-Band Equalizer', href: '#stack' } // laptop.py includes an EQ function
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Architecture Notes', href: '#learn' },
      { label: 'Server Setup Guide', href: '/docs/setup' },
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

