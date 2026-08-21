import { useRef } from "react";
import type { RefObject } from "react";

export default function useDragScroll(sliderRef: RefObject<HTMLDivElement | null>) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    isDragging.current = true;

    sliderRef.current.setPointerCapture(e.pointerId);

    startX.current = e.clientX;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !sliderRef.current) return;

    e.preventDefault();

    const walk = (e.clientX - startX.current) * 1.5;

    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    isDragging.current = false;

    if (sliderRef.current.hasPointerCapture(e.pointerId)) {
      sliderRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: stopDragging,
    onPointerLeave: stopDragging,
  };
}
