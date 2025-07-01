"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";

export const useCourseCompletion = (course, userProgress) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (course && userProgress) {
      const progress = userProgress.progress || 0;
      const wasCompleted = userProgress.wasCompleted || false;
      const isNowCompleted = progress >= 100;

      // If course just got completed (wasn't completed before but is now)
      if (isNowCompleted && !wasCompleted) {
        // Trigger celebration
        celebrateCompletion();

        // Show success message
        toast.success(
          `🎉 Congratulations! You've completed "${course.title}"!`,
          {
            duration: 6000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          }
        );

        // Mark as celebrated to prevent repeated celebrations
        userProgress.wasCompleted = true;
      }
    }
  }, [course, userProgress]);

  const celebrateCompletion = () => {
    // Confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  return { celebrateCompletion };
};
