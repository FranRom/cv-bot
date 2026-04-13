import { useEffect, useState } from "react";

const FRAMES = ["/robot-talk-1.png", "/robot-talk-2.png"];
const IDLE = "/robot-idle.png";
const TALK_INTERVAL = 180; // ms between frames

interface RobotAvatarProps {
  isTalking: boolean;
  size?: string;
}

export function RobotAvatar({ isTalking, size = "w-10 h-10" }: RobotAvatarProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!isTalking) {
      setFrameIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FRAMES.length);
    }, TALK_INTERVAL);

    return () => clearInterval(interval);
  }, [isTalking]);

  return (
    <img
      src={isTalking ? FRAMES[frameIndex] : IDLE}
      alt="Fran Bot"
      className={`${size} rounded-full object-cover flex-shrink-0 ring-1 ring-white/10 ${
        isTalking ? "ring-blue-400/30" : ""
      } transition-shadow`}
    />
  );
}
