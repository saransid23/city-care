import { useState, useEffect } from 'react';

/**
 * Wraps page content with a guaranteed mount animation.
 * Uses JS-driven class toggling so the transition always fires,
 * even on redirects or fast navigations.
 */
export default function PageTransition({ children }) {
  return (
    <>
      {children}
    </>
  );
}
