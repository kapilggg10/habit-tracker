"use client";

import { useState, useEffect } from "react";

const atomicHabitsQuotes = [
  "Small changes make a remarkable difference.",
  "You get what you repeat every day.",
  "Habits are the compound interest of self-improvement.",
  "Every action you take is a vote.",
  "Focus on systems, not on goals.",
  "You fall to the level of your systems.",
  "Success is the product of daily habits.",
  "Time magnifies the margin between success and failure.",
  "Habits can work for you or against you.",
  "Focus not on what you want to achieve.",
  "But on who you wish to become.",
  "Your identity emerges out of your habits.",
  "What you really want is actually the process.",
  "The goal is not to read a book.",
  "The goal is to become a reader.",
  "The goal is not to run a marathon.",
  "The goal is to become a runner.",
  "The goal is not to learn an instrument.",
  "The goal is to become a musician.",
  "True behavior change is identity change.",
  "The more you repeat a behavior, the more.",
  "The more you reinforce the identity associated with it.",
  "The more motivated you become to stick with it.",
  "Habits are not about having something.",
  "They are about becoming someone.",
  "Your habits shape your identity.",
  "And your identity shapes your habits.",
  "You do not rise to the level of your goals.",
  "You fall to the level of your systems.",
  "The most effective way to change your habits.",
];

export function InspirationToast() {
  const [currentQuote, setCurrentQuote] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first quote after a delay
    const initialTimeout = setTimeout(() => {
      showRandomQuote();
    }, 2000);

    // Then show a new quote every 8 seconds
    const interval = setInterval(() => {
      showRandomQuote();
    }, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const showRandomQuote = () => {
    // Fade out
    setIsVisible(false);
    
    // After fade out, pick new quote and fade in
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * atomicHabitsQuotes.length);
      setCurrentQuote(atomicHabitsQuotes[randomIndex]!);
      setIsVisible(true);
    }, 300);
  };

  if (!currentQuote) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-sm transform transition-all duration-300 sm:max-w-md ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div className="rounded-2xl bg-white/90 px-6 py-4 shadow-2xl backdrop-blur-md dark:bg-gray-800/90">
        <p className="text-left text-sm font-medium text-gray-800 dark:text-gray-200">
          {currentQuote}
        </p>
      </div>
    </div>
  );
}