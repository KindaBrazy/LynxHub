import contextMenuIpc from '@lynx_shared/ipc/context_menu';

type DimensionsMsg = {width: number; height: number; dpr: number};

export function ResizeWindowToContentSize(ref: HTMLDivElement | null) {
  let raf: number | null = null;
  let lastSent: {w: number; h: number} | null = null;

  if (!ref) return;

  const sendSize = () => {
    const width = Math.max(Math.ceil(ref.scrollWidth), Math.ceil(ref.getBoundingClientRect().width));
    const height = Math.max(Math.ceil(ref.scrollHeight), Math.ceil(ref.getBoundingClientRect().height));

    const PADDING = 2;
    const w = Math.max(1, Math.round(width + PADDING));
    const h = Math.max(1, Math.round(height + PADDING));

    if (lastSent && lastSent.w === w && lastSent.h === h) {
      return;
    }

    lastSent = {w, h};

    const dpr = window.devicePixelRatio || 1;
    const msg: DimensionsMsg = {width: w, height: h, dpr};
    contextMenuIpc.send.resizeWindow(msg);
  };

  new ResizeObserver(() => {
    if (raf != null) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = null;
      sendSize();
    });
  }).observe(ref);

  sendSize();
}
