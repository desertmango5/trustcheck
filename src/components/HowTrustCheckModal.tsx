"use client";

import { useEffect, useRef, useState } from "react";
import HowTrustCheckWorksArticle from "@/components/HowTrustCheckWorksArticle";

const HOW_MODAL_ANIMATION_MS = 280;

export default function HowTrustCheckModal() {
  const [isRendered, setIsRendered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  function openModal() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isRendered) {
      setIsRendered(true);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsExpanded(true);
        });
      });
      return;
    }
    setIsExpanded(true);
  }

  function closeModal() {
    setIsExpanded(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      closeTimerRef.current = null;
    }, HOW_MODAL_ANIMATION_MS);
  }

  useEffect(() => {
    if (!isRendered) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isRendered]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {isRendered ? (
        <div
          className={`how-modal-overlay ${isExpanded ? "is-open" : "is-closing"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-modal-title"
        >
          <button
            type="button"
            className="how-modal-close"
            aria-label="Close How TrustCheck Works"
            onClick={closeModal}
          >
            X
          </button>
          <div className="how-modal-shell">
            <main className="how-page how-modal-page">
              <HowTrustCheckWorksArticle
                showBackLink={false}
                titleId="how-modal-title"
              />
            </main>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="how-floating-button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={isExpanded}
      >
        How TrustCheck Works
      </button>
    </>
  );
}
