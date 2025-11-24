import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type UseCase = {
  title: string;
  summary: string;
  details: string;
  image: string;
};

const useCases: UseCase[] = [
  {
    title: 'Podcast',
    summary: 'Clean, broadcast-ready vocals for remote hosts and guests.',
    details:
      'Minimize and eliminate the ambient noise, the electric current sound of the recording equipment, the hissing noise, traffic noise, air conditioner noise, or any unwanted noise from the voiceover for your podcast.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Online Course',
    summary: 'Crisp lessons that keep students focused.',
    details:
      'Reduce street noise, machine noise, and household noise such as door slamming, baby crying, and renovation noise when creating online course videos or recording lives, webinars, seminars, and online meetings.',
    image:
      'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Interview',
    summary: 'Capture candid conversations on-the-go.',
    details:
      'Remove all noise other than human voices to enhance human speech in your street interview or a user interview, and enhance voice clarity for fast speech deciphering.',
    image:
      'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Vlog',
    summary: 'Audience-ready voiceovers anywhere.',
    details:
      'Make your travel vlog video look more professional by reducing and eliminating the noisy ambient sound, such as wind and traffic noise, whether you are using a mobile phone or camera without professional audio equipment.',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: 'Online Meeting',
    summary: 'Professional polish for daily calls and streams.',
    details:
      'Remove the background noise in your recorded meeting video and audio, such as typing, closing a door, room echo, or the sounds of a nearby construction site, and retain the crisp meeting call recordings.',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80'
  }
];

const ITEM_HEIGHT = 78;

const UseCasesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCase = useMemo(() => useCases[activeIndex], [activeIndex]);

  return (
    <section className="section usecases">
      <div className="usecases__text">
        <p className="pill">Use cases</p>
        <h2>Elevate Your Content Creations with Noise Reduction</h2>
        <p className="usecases__intro">
          Instantly enhance voice quality and remove ambient background noise including fan hum,
          traffic, tapping, and chatter. Focus on the story while the browser takes care of cleanup.
        </p>
      </div>
      <div className="usecases__content">
        <div className="usecases__image card">
          <img src={activeCase.image} alt={activeCase.title} />
        </div>
        <div className="usecases__divider">
          <span
            className="usecases__indicator"
            style={{ '--indicator-offset': `${activeIndex * ITEM_HEIGHT}px` } as CSSProperties}
          />
        </div>
        <div className="usecases__list">
          {useCases.map((item, index) => (
            <button
              key={item.title}
              className={`usecases__item ${index === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <span>{item.title}</span>
              {/* <p>{item.summary}</p> */}
            </button>
          ))}
          <div className="usecases__details-card card">
            <h3>{activeCase.title}</h3>
            <p>{activeCase.details}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;

