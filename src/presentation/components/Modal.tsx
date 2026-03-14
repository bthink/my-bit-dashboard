import {useEffect, useRef, useState} from "react";
import {Button} from "./Button";

const FALLBACK_CLOSE_MS = 250;

const getCloseDurationMs = (): number => {
  if (typeof document === "undefined") return FALLBACK_CLOSE_MS;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue("--modal-close-duration")
    .trim();
  if (!val) return FALLBACK_CLOSE_MS;
  if (val.endsWith("ms")) return parseFloat(val) || FALLBACK_CLOSE_MS;
  if (val.endsWith("s")) return (parseFloat(val) || 0.25) * 1000;
  return FALLBACK_CLOSE_MS;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const Modal = ({isOpen, onClose, title, children}: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const wasOpenRef = useRef(isOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<{title: string; children: React.ReactNode}>({
    title: "",
    children: null,
  });

  if (isOpen) {
    lastContentRef.current = {title, children};
    wasOpenRef.current = true;
  }

  const inLeavePhase = !isOpen && (isClosing || wasOpenRef.current);
  const visible = isOpen || inLeavePhase;
  const displayTitle = inLeavePhase ? lastContentRef.current.title : title;
  const displayChildren = inLeavePhase
    ? lastContentRef.current.children
    : children;

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    } else if (wasOpenRef.current) {
      setIsClosing(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isClosing) return;
    const el = contentRef.current;
    const done = () => {
      wasOpenRef.current = false;
      setIsClosing(false);
    };
    if (el) {
      el.addEventListener("transitionend", done, {once: true});
    }
    const durationMs = getCloseDurationMs();
    const fallback = setTimeout(done, durationMs + 50);
    return () => {
      if (el) el.removeEventListener("transitionend", done);
      clearTimeout(fallback);
    };
  }, [isClosing]);

  useEffect(() => {
    if (!visible) return;
    const handle = (e: KeyboardEvent) =>
      e.key === "Escape" && !inLeavePhase && onClose();
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [visible, inLeavePhase, onClose]);

  if (!visible) return null;

  const overlayClass = inLeavePhase
    ? "modal-overlay-leave"
    : "modal-overlay-enter";
  const contentClass = inLeavePhase
    ? "modal-content-leave"
    : "modal-content-enter";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`absolute inset-0 bg-[var(--color-backdrop)] backdrop-blur-sm ${overlayClass}`}
        onClick={() => !inLeavePhase && onClose()}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className={`relative w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl ${contentClass}`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-text)]">
            {displayTitle}
          </h2>
          <Button
            type="button"
            size="icon"
            onClick={() => !inLeavePhase && onClose()}
            className="text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
            aria-label="Close"
          >
            &times;
          </Button>
        </div>
        <div className="p-4">{displayChildren}</div>
      </div>
    </div>
  );
};
