import { useEffect, useRef } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface FlightConfig {
  path: string;
  duration: number;
  delay: number;
  stroke: string;
  planeFill: string;
}

const FLIGHTS: FlightConfig[] = [
  {
    path: 'M 8 72 Q 28 18, 52 48 T 92 26',
    duration: 20000,
    delay: 0,
    stroke: '#213659',
    planeFill: '#213659',
  },
  {
    path: 'M 12 28 C 32 58, 58 32, 72 52 S 94 78, 86 88',
    duration: 26000,
    delay: 7000,
    stroke: '#2563eb',
    planeFill: '#2563eb',
  },
];

function PlaneShape({ fill }: { fill: string }) {
  return (
    <g transform="translate(-7, 0)">
      <path
        d="M 0 0 L 14 0 M 4 -5 L 6 0 L 4 5 M -1 -3 L -3.5 0 L -1 3"
        fill="none"
        stroke={fill}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

interface AnimatedPlaneProps {
  pathD: string;
  duration: number;
  delay: number;
  planeFill: string;
  reduceMotion: boolean;
}

function AnimatedPlane({ pathD, duration, delay, planeFill, reduceMotion }: AnimatedPlaneProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const plane = planeRef.current;
    if (!path || !plane) return;

    const totalLength = path.getTotalLength();

    const setPosition = (progress: number) => {
      const distance = progress * totalLength;
      const point = path.getPointAtLength(distance);
      const lookAhead = path.getPointAtLength((distance + 1.5) % totalLength);
      const angle = (Math.atan2(lookAhead.y - point.y, lookAhead.x - point.x) * 180) / Math.PI;
      plane.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`);
    };

    if (reduceMotion) {
      setPosition(0.35);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        setPosition(0);
        frameId = requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;
      setPosition(progress);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [pathD, duration, delay, reduceMotion]);

  return (
    <>
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={planeFill}
        strokeWidth="0.35"
        strokeDasharray="1.2 1.2"
        strokeLinecap="round"
        opacity={0.45}
      />
      <g ref={planeRef}>
        <PlaneShape fill={planeFill} />
      </g>
    </>
  );
}

export default function HeroFlightAnimation() {
  const { settings } = useAccessibility();

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {FLIGHTS.map((flight, index) => (
        <AnimatedPlane
          key={index}
          pathD={flight.path}
          duration={flight.duration}
          delay={flight.delay}
          planeFill={flight.planeFill}
          reduceMotion={settings.reduceMotion}
        />
      ))}
    </svg>
  );
}
