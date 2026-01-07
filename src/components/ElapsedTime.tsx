import { useEffect, useState } from "react";

type ElapsedTimeProps = {
  startTime: Date;
  intervalMs?: number;
};

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours && `${hours}h`,
    minutes && `${minutes}m`,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function ElapsedTime({
  startTime,
  intervalMs = 1000,
}: ElapsedTimeProps) {
  console.log(startTime)
  const start = new Date(startTime).getTime();
  const [elapsed, setElapsed] = useState(Date.now() - start);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - start);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [start, intervalMs]);

  return <span>{formatElapsed(elapsed)}</span>;
}
