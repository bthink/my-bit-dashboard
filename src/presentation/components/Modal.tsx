import {useEffect, useRef, useState} from "react";
import {Button} from "./Button";

const CLOSE_DURATION_MS = 200;

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const Modal = ({isOpen, onClose, title, children}: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const wasOpenRef = useRef(isOpen);
  const lastContentRef = useRef<{ title: string; children: React.ReactNode }>({
    title: "",
    children: null,
  });

  if (isOpen) {
    lastContentRef.current = { title, children };
    wasOpenRef.current = true;
  }

  const inLeavePhase = !isOpen && (isClosing || wasOpenRef.current);
  const visible = isOpen || inLeavePhase;
  const displayTitle = inLeavePhase ? lastContentRef.current.title : title;
  const displayChildren = inLeavePhase ? lastContentRef.current.children : children;

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      setIsClosing(true);
      const t = setTimeout(() => setIsClosing(false), CLOSE_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return;
    const handle = (e: KeyboardEvent) =>
      e.key === "Escape" && !inLeavePhase && onClose();
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [visible, inLeavePhase, onClose]);

  if (!visible) return null;

  const overlayClass = inLeavePhase ? "modal-overlay-leave" : "modal-overlay-enter";
  const contentClass = inLeavePhase ? "modal-content-leave" : "modal-content-enter";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm ${overlayClass}`}
        onClick={() => !inLeavePhase && onClose()}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl ${contentClass}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {displayTitle}
          </h2>
          <Button
            type="button"
            size="icon"
            onClick={() => !inLeavePhase && onClose()}
            className="text-slate-500 hover:text-slate-800"
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
