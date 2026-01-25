'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedSection({ children, className = '' }) {
  const container = useRef(null);

  useGSAP(() => {
    gsap.fromTo(container.current,
      {
        y: 50,
        autoAlpha: 0
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top bottom', // Trigger as soon as it enters the viewport
          toggleActions: 'play none none none',
        }
      }
    );
  }, { scope: container });

  return (
    <div
      ref={container}
      className={`${className} opacity-0`}
    >
      {children}
    </div>
  );
}