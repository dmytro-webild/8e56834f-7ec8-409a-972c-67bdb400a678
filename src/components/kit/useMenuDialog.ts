import { useEffect, useRef, type RefObject } from "react";
import { useLenis } from "lenis/react";

const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const useMenuDialog = (open: boolean, panelRef: RefObject<HTMLElement | null>, onClose: () => void, lockScroll = true) => {
  const lenis = useLenis();
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    const trigger = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    if (lockScroll) {
      root.style.overflow = "hidden";
      lenis?.stop();
    }
    const items = () => {
      const panel = panelRef.current;
      if (!panel) return [];
      const inside = Array.from(panel.querySelectorAll<HTMLElement>(focusable)).filter((el) => !el.closest("[inert]") && el.getClientRects().length > 0);
      return trigger && !panel.contains(trigger) && trigger.isConnected && trigger.hasAttribute("aria-expanded") ? [trigger, ...inside] : inside;
    };
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const first = items().find((el) => panel?.contains(el));
      first?.focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const at = list.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && at <= 0) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (at === -1 || at === list.length - 1)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      if (lockScroll) {
        root.style.overflow = prev;
        lenis?.start();
      }
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open, lenis, lockScroll, panelRef]);
};

export default useMenuDialog;
