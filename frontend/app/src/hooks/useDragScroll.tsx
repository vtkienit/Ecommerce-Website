import { useRef, useState } from "react";

export default function useDragScroll() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    setIsDragging(true);

    sliderRef.current.setPointerCapture(e.pointerId);

    startX.current = e.clientX;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;

    e.preventDefault();

    const walk = (e.clientX - startX.current) * 1.5;

    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    setIsDragging(false);

    sliderRef.current.releasePointerCapture(e.pointerId);
  };

  return {
    sliderRef,
    dragEvents: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stopDragging,
      onPointerLeave: stopDragging,
    },
  };
}