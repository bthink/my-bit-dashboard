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
  const [wasOpen, setWasOpen] = useState(false);
  const [lastContent, setLastContent] = useState<{
    title: string;
    children: React.ReactNode;
  }>({ title: "", children: null });
  const contentRef = useRef<HTMLDivElement>(null);

  if (isOpen) {
    if (lastContent.title !== title || lastContent.children !== children) {
      setLastContent({ title, children });
    }
    if (!wasOpen) setWasOpen(true);
    if (isClosing) setIsClosing(false);
  } else if (wasOpen && !isClosing) {
    setIsClosing(true);
  }

  const inLeavePhase = !isOpen && (isClosing || wasOpen);
  const visible = isOpen || inLeavePhase;
  const displayTitle = inLeavePhase ? lastContent.title : title;
  const displayChildren = inLeavePhase ? lastContent.children : children;

  useEffect(() => {
    if (!isClosing) return;
    const el = contentRef.current;
    const done = () => {
      setWasOpen(false);
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
          <h2
            id="modal-title"
            className="text-lg font-semibold text-[var(--color-text)]"
          >
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
