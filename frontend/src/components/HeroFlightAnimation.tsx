import { useEffect, useRef } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { BASE_URL } from '@/constants';

const PLANE_ICON = `${BASE_URL}/uploads/hero/hero-plain.png`;
const PLANE_SIZE = 9;
const PLANE_HALF = PLANE_SIZE / 2;
const PLANE_ROTATION_OFFSET = 45;

interface FlightConfig {
  path: string;
  duration: number;
  delay: number;
  stroke: string;
}

const FLIGHTS: FlightConfig[] = [
  {
    path: 'M 10 78 Q 38 42, 55 40 T 90 32',
    duration: 22000,
    delay: 0,
    stroke: '#213659',
  },
  {
    path: 'M 14 22 C 38 38, 62 58, 88 72',
    duration: 28000,
    delay: 9000,
    stroke: '#2563eb',
  },
];

interface AnimatedPlaneProps {
  pathD: string;
  duration: number;
  delay: number;
  stroke: string;
  reduceMotion: boolean;
}

function AnimatedPlane({ pathD, duration, delay, stroke, reduceMotion }: AnimatedPlaneProps) {
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
      plane.setAttribute(
        'transform',
        `translate(${point.x}, ${point.y}) rotate(${angle + PLANE_ROTATION_OFFSET})`,
      );
    };

    if (reduceMotion) {
      setPosition(0.4);
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
        stroke={stroke}
        strokeWidth="0.35"
        strokeDasharray="1.2 1.2"
        strokeLinecap="round"
        opacity={0.45}
      />
      <g ref={planeRef}>
        <image
          href={PLANE_ICON}
          x={-PLANE_HALF}
          y={-PLANE_HALF}
          width={PLANE_SIZE}
          height={PLANE_SIZE}
          preserveAspectRatio="xMidYMid meet"
        />
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
          stroke={flight.stroke}
          reduceMotion={settings.reduceMotion}
        />
      ))}
    </svg>
  );
}
