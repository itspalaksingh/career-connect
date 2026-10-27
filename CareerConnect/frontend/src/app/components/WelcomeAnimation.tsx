'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type IntroPhase = 'opening' | 'leaving' | 'done';

export default function WelcomeAnimation() {
  const [phase, setPhase] = useState<IntroPhase>('opening');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      return;
    }

    const leaveTimer = window.setTimeout(() => setPhase('leaving'), 950);
    const removeTimer = window.setTimeout(() => setPhase('done'), 1400);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`site-intro site-intro-${phase}`} aria-hidden="true">
      <div className="site-intro-content">
        <span className="site-intro-orbit site-intro-orbit-one" />
        <span className="site-intro-orbit site-intro-orbit-two" />
        <span className="site-intro-mark">
          <Image src="/icon.svg" alt="" width={76} height={76} priority />
        </span>
        <strong className="site-intro-name">CareerConnect<span>.</span></strong>
        <span className="site-intro-tagline">Opening your next opportunity</span>
        <span className="site-intro-progress"><span /></span>
      </div>
    </div>
  );
}
