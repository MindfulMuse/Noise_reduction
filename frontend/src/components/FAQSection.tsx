import { useState } from 'react';

const faqs = [
  {
    question: 'What kind of noise can the browser console remove?',
    answer:
      'The pipeline targets 30+ sources: HVAC hum, traffic, laptop fans, crowd chatter, static from cables, and wind. The AudioWorklet applies a smart gate, while RNNoise (optional WASM) removes broadband noise without harming speech.'
  },
  {
    question: 'How do I stream audio from my phone into the app?',
    answer:
      'Open the phone capture page, start a WebRTC call, and accept it on this device. The peer connection feeds directly into the AudioContext so the same suppression/visualizer graph treats the remote stream.'
  },
  {
    question: 'Do I need native software or drivers?',
    answer:
      'No installs required. Everything runs inside Chrome/Edge using Web Audio + WebAssembly. Grant mic permissions (or share a remote track) and the DSP graph spins up instantly.'
  },
  {
    question: 'Can I monitor the cleaned audio in real time?',
    answer:
      'Yes. The analyser node drives the waveform while the processed signal routes to your speakers/headphones with sub-30 ms latency, ideal for live monitoring or foldback.'
  },
  {
    question: 'Is the RNNoise model required?',
    answer:
      'No. The default AudioWorklet noise gate + adaptive smoothing already removes constant ambience. If you drop in the RNNoise WASM file, the worklet upgrades automatically for neural suppression.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section faq">
      <div className="faq__headline card">
        <h2>Frequently Asked Questions about Noise Cleaner</h2>
      </div>
      <div className="faq__list">
        {faqs.map((item, index) => {
          const isOpen = index === openIndex;
          return (
            <button
              key={item.question}
              className={`faq__item ${isOpen ? 'open' : ''}`}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <div className="faq__prompt">
                <span className="faq__icon">?</span>
                <h3>{`${index + 1}. ${item.question}`}</h3>
                <span className="faq__caret">{isOpen ? '−' : '+'}</span>
              </div>
              {isOpen ? <p className="faq__answer">{item.answer}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;

