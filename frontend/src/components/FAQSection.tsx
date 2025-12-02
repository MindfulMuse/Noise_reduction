import { useState } from 'react';

const faqs = [
  {
    question: 'What technology powers the noise reduction?',
    answer:
      'The core engine uses DeepFilterNet, a Low-Complexity Deep Neural Network (DNN) implemented in PyTorch. Unlike simple noise gates, this deep learning model is trained to separate speech from complex, non-stationary background noise (like typing, traffic, or wind) in real-time.'
  },
  {
    question: 'How is audio transmitted between devices?',
    answer:
      'The system uses a centralized WebSocket architecture (via aiohttp). The "Sender" captures raw PCM audio and streams it to the Python server. The server processes the audio through the DeepFilterNet model (on GPU/CPU) and broadcasts the clean signal to the "Receiver" immediately.'
  },
  {
    question: 'Does this require a GPU to run?',
    answer:
      'While the server can run on a standard CPU, a CUDA-capable GPU is highly recommended for the lowest latency. The system automatically detects if CUDA is available (via torch.cuda) to accelerate the neural network inference steps.'
  },
  {
    question: 'Can I process pre-recorded files instead of streaming?',
    answer:
      'Yes. The application supports a file upload mode. You can upload WAV, MP3, or FLAC files to the `/process` endpoint. The server runs the same DeepFilterNet enhancement on the file and returns a downloadable, cleaned WAV file.'
  },
  {
    question: 'How do I connect devices on different networks?',
    answer:
      'For local connections, devices simply need to be on the same WiFi (using the local IP). For remote access, the server is compatible with tunneling services like ngrok. You can expose the WebSocket port (8080) via ngrok and connect the sender/receiver using the generated public URL.'
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

