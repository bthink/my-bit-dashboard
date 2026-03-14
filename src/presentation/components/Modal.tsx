import {useEffect, useRef, useState} from "react";

const CLOSE_DURATION_MS = 200;

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const Modal = ({isOpen, onClose, title, children}: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const prevOpenRef = useRef(isOpen);
  const visible = isOpen || isClosing;

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      prevOpenRef.current = true;
    } else if (prevOpenRef.current) {
      prevOpenRef.current = false;
      setIsClosing(true);
      const t = setTimeout(() => setIsClosing(false), CLOSE_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return;
    const handle = (e: KeyboardEvent) =>
      e.key === "Escape" && !isClosing && onClose();
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [visible, isClosing, onClose]);

  if (!visible) return null;

  const leave = isClosing;
  const overlayClass = leave ? "modal-overlay-leave" : "modal-overlay-enter";
  const contentClass = leave ? "modal-content-leave" : "modal-content-enter";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`absolute inset-0 bg-slate-900/30 backdrop-blur-sm ${overlayClass}`}
        onClick={() => !isClosing && onClose()}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl ${contentClass}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => !isClosing && onClose()}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 active:scale-95"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
