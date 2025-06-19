import { useEffect, useRef } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  maxVerticalDistance?: number;
}

export const useSwipeGesture = (
  element: React.RefObject<HTMLElement> | null,
  options: SwipeGestureOptions
) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const {
    onSwipeLeft,
    onSwipeRight,
    minSwipeDistance = 50,
    maxVerticalDistance = 100,
  } = options;

  useEffect(() => {
    const el = element?.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 垂直方向の移動が大きすぎる場合はスワイプとして認識しない
      if (Math.abs(deltaY) > maxVerticalDistance) {
        touchStartRef.current = null;
        return;
      }

      // 水平方向のスワイプを検出
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      touchStartRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // スクロールを防ぐために必要に応じて使用
      // e.preventDefault();
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [element, onSwipeLeft, onSwipeRight, minSwipeDistance, maxVerticalDistance]);
};