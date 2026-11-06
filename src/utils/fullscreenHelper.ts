/**
 * Helper Utilitas Fullscreen & Integritas Ujian
 * Mendukung berbagai browser modern & fallback
 */

export const enterFullscreen = async (element?: HTMLElement): Promise<boolean> => {
  const target = element || document.documentElement;
  try {
    const el = target as any;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    } else if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
      return true;
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Mode layar penuh diblokir oleh browser atau membutuhkan interaksi pengguna langsung:', err);
  }
  return false;
};

export const exitFullscreen = async (): Promise<void> => {
  try {
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    }
  } catch (err) {
    // Abaikan jika tidak sedang fullscreen
  }
};

export const isFullscreenActive = (): boolean => {
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
};
