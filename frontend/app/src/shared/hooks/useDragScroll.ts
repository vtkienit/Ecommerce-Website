import {
  useRef,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";

const DRAG_THRESHOLD = 6;

export default function useDragScroll(sliderRef: RefObject<HTMLDivElement | null>) {
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current || event.button !== 0) return;

    isPointerDown.current = true;
    isDragging.current = false;
    hasDragged.current = false;
    startX.current = event.clientX;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider || !isPointerDown.current) return;

    if ((event.buttons & 1) === 0) {
      stopDragging(event);
      return;
    }

    const distance = event.clientX - startX.current;
    if (!isDragging.current && Math.abs(distance) < DRAG_THRESHOLD) return;

    if (!isDragging.current) {
      isDragging.current = true;
      hasDragged.current = true;
      slider.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    slider.scrollLeft = scrollLeft.current - distance * 1.5;
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    isPointerDown.current = false;
    isDragging.current = false;

    if (slider?.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }

    if (hasDragged.current) {
      window.setTimeout(() => {
        hasDragged.current = false;
      });
    }
  };

  const onLostPointerCapture = () => {
    isPointerDown.current = false;
    isDragging.current = false;
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasDragged.current) return;

    event.preventDefault();
    event.stopPropagation();
    hasDragged.current = false;
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: stopDragging,
    onPointerCancel: stopDragging,
    onPointerLeave: stopDragging,
    onLostPointerCapture,
    onClickCapture,
    onDragStart: (event: DragEvent<HTMLDivElement>) => event.preventDefault(),
  };
}
