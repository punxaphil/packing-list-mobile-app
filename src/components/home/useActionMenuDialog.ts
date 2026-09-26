import { useEffect, useRef, useState } from "react";

export const useActionMenuDialog = (visible: boolean) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (visible && !dialog?.open) dialog?.showModal();
    else if (!visible && dialog?.open) dialog.close();
  }, [visible]);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return { dialogRef, headerRef, headerHeight };
};
