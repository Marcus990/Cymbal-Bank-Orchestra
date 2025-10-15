import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLDivElement>(null);
  const [isInside, setIsInside] = useState(false);

  // Cleanup effect to reset hover state when component unmounts
  useEffect(() => {
    return () => {
      // Reset hover state when component unmounts
      setIsInside(false);
    };
  }, []);

  // Reset hover state when component updates
  useEffect(() => {
    setIsInside(false);
  }, [children]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const bounds = ref.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - bounds.left + 10,
        y: e.clientY - bounds.top + 10
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsInside(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsInside(false);
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={cn("relative overflow-visible", className)}
      style={{ cursor: "grab" }}
    >
      {isInside && <FollowPointer x={mousePosition.x} y={mousePosition.y} title={title} />}
      {children}
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title,
}: {
  x: number;
  y: number;
  title?: string | React.ReactNode;
}) => {
  // Music note icon component
  const MusicNoteIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block mr-2"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );

  return (
    <div
      className="absolute z-[99999] pointer-events-none"
      style={{ 
        top: `${y}px`, 
        left: `${x}px`,
        transform: 'translateX(10px) translateY(20px)'
      }}
    >
      <div
        style={{ backgroundColor: "#22d3ee" }} // Official cymbal bank accent blue
        className="rounded-full px-3 py-2 text-sm font-semibold text-cymbal-dark shadow-md whitespace-nowrap flex items-center transition-colors duration-200 hover:bg-[#06b6d4]"
      >
        <MusicNoteIcon />
        {title || "Choose your Agent!"}
      </div>
    </div>
  );
};
