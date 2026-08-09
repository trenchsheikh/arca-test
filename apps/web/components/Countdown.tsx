'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  endsAt: string | Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function Countdown({ endsAt, className = '' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          total: difference,
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  if (timeLeft.total <= 0) {
    return <div className={className}>ICO Ended</div>;
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl font-bold text-white">{value.toString().padStart(2, '0')}</div>
      <div className="text-xs text-gray-400 uppercase">{label}</div>
    </div>
  );
}
