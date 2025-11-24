import { useMemo, useState } from 'react';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "I've been routing my phone into Noise Cleaner during shoots, and it scrubs the ambient chaos without touching the natural tone. It's become a non-negotiable part of my mobile rig.",
    author: 'Judy Kuhn',
    role: 'Field Journalist'
  },
  {
    quote:
      'Our async course recordings happen in shared spaces. The browser worklet wipes HVAC rumble and keyboard taps so learners only notice the actual lessons.',
    author: 'Marcus Elliott',
    role: 'Online Instructor'
  },
  {
    quote:
      'RNNoise in the browser still amazes me—guests can join from anywhere, and the stream that reaches the mixer already sounds studio-ready.',
    author: 'Priya Desai',
    role: 'Podcast Producer'
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = useMemo(() => testimonials[activeIndex], [activeIndex]);

  return (
    <section className="section testimonials">
      <div className="testimonials__bubble card">
        <div className="testimonials__quote-mark">“</div>
        <p className="testimonials__text">{activeTestimonial.quote}</p>
        <div className="testimonials__quote-mark close">”</div>

        <div className="testimonials__footer">
          <div className="testimonials__wave" aria-hidden>
            <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
              <path
                d="M1 16h10l4-12 6 24 6-24 6 24 6-24 6 24 6-24 6 24 4-12h18"
                stroke="#7c84ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="testimonials__author">{activeTestimonial.author}</p>
            <p className="testimonials__role">{activeTestimonial.role}</p>
          </div>
        </div>

        <div className="testimonials__dots" role="tablist" aria-label="Testimonials">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonial-dot ${index === activeIndex ? 'active' : ''}`}
              aria-label={`Show testimonial ${index + 1}`}
              aria-selected={index === activeIndex}
              role="tab"
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="testimonials__copy">
        <h2>
          What do people say about Noise Cleaner
        </h2>
        <p className="testimonials__gradient">Noise Reduction</p>
        {/* <p className="testimonials__blurb">
          Creators, educators, and remote teams rely on the console every day to turn noisy sources
          into polished tracks without leaving the browser.
        </p> */}
      </div>
    </section>
  );
};

export default TestimonialsSection;

