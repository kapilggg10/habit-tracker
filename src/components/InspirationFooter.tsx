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
  "Focus on who you wish to become.",
  "Your identity emerges out of your habits.",
  "What you really want is the process.",
  "The goal is to become a reader.",
  "The goal is to become a runner.",
  "The goal is to become a musician.",
  "True behavior change is identity change.",
  "Habits are not about having something.",
  "They are about becoming someone.",
  "Your habits shape your identity.",
  "Your identity shapes your habits.",
  "You fall to the level of your systems.",
  "Small habits don't add up. They compound.",
  "Fall in love with the process.",
  "The results will come naturally.",
  "Make good habits obvious and easy.",
  "Make bad habits invisible and difficult.",
  "One percent better each day compounds.",
  "Professionals stick to the schedule.",
  "Amateurs let life get in the way.",
  "All big things come from small beginnings.",
];

export function InspirationFooter() {
  const [currentQuote, setCurrentQuote] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first quote after a delay
    const initialTimeout = setTimeout(() => {
      showRandomQuote();
    }, 2000);

    // Then show a new quote every 15 seconds
    const interval = setInterval(() => {
      showRandomQuote();
    }, 15000);

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
    <footer className="mt-auto sticky bottom-0 z-30 border-t border-gray-200/30 bg-gradient-to-t from-blue-300 to-purple-300 backdrop-blur-md shadow-[0_-8px_30px_rgba(0,0,0,0.3),0_-4px_10px_rgba(0,0,0,0.2)] dark:border-gray-700/30">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-300 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          <p className="text-center text-sm font-medium text-gray-800 dark:text-gray-100">
            {currentQuote}
          </p>
        </div>
      </div>
    </footer>
  );
}
