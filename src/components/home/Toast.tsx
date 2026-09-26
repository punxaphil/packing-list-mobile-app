import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ToastMessage } from "./ToastMessage.tsx";

type ToastContextValue = { show: (message: string, displayDuration?: number) => void };
type ToastState = { id: number; message: string; displayDuration: number };
const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DISPLAY_DURATION = 2000;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("ToastProvider is required");
  return context;
};

export const useToastMessage = () => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);
  const show = useCallback((message: string, displayDuration = DEFAULT_DISPLAY_DURATION) => {
    setToast({ id: ++nextId.current, message, displayDuration });
  }, []);
  const dismiss = useCallback((id: number) => setToast((current) => (current?.id === id ? null : current)), []);
  return { toast, show, dismiss };
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast, show, dismiss } = useToastMessage();

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && <ToastMessage key={toast.id} toast={toast} onDone={dismiss} />}
    </ToastContext.Provider>
  );
};
