import React, { useState, useEffect } from 'react';

/**
 * TypewriterText Component
 * Animates text letter-by-letter with dynamic typing cadence,
 * backspacing, word cycling, and a glowing blinking cursor.
 */
const TypewriterText = ({
  words = [
    'Digital Health Records',
    'Instant Doctor Bookings',
    'Zero-Paperwork OPD Care',
    'Live HD Teleconsultations',
  ],
  typingSpeed = 75,
  deletingSpeed = 35,
  pauseDuration = 2000,
  className = '',
  textColor = 'text-blue-600',
  cursorColor = 'bg-blue-600',
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentWord = words[wordIndex % words.length];

    if (!isDeleting && displayText.length < currentWord.length) {
      // Type next character
      timer = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && displayText.length === currentWord.length) {
      // Full word typed, pause before deleting
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && displayText.length > 0) {
      // Delete character
      timer = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && displayText.length === 0) {
      // Word completely deleted, switch to next word
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center whitespace-nowrap select-none font-black ${className}`}>
      {/* 100% Solid, Crisp & Clearly Visible Animated Text */}
      <span className={`inline-block font-black tracking-tight whitespace-nowrap ${textColor}`}>
        {displayText || '\u00A0'}
      </span>
      {/* Dynamic Blinking Typewriter Cursor */}
      <span
        aria-hidden="true"
        className={`inline-block w-[3px] sm:w-[4px] h-[0.9em] ml-1.5 ${cursorColor} rounded-full cursor-blink align-middle shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.7)]`}
      />
    </span>
  );
};

export default TypewriterText;
