'use client';

import { useEffect, useRef, useState } from 'react';

/** Posters render immediately; video bytes are requested only near the viewport.
 * Data-saver and reduced-motion users get the poster, not forced autoplay. */
export default function AutoVideo({ sources = [], mobileSources = null, poster = '', mobilePoster = '',
  maxMobile = 767, eager = false, pauseOffscreen = true, className = '', style, onReady, ...rest }) {
  const ref = useRef(null);
  const readyCallback = useRef(onReady);
  readyCallback.current = onReady;
  const didReady = useRef(false);
  const [failed, setFailed] = useState(false);
  function settle() {
    if (!didReady.current) { didReady.current = true; readyCallback.current?.(); }
  }
  const sourceKey = JSON.stringify(sources);
  const mobileKey = JSON.stringify(mobileSources);
  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia(`(max-width: ${maxMobile}px)`);
    let visible = eager || !pauseOffscreen;
    let activated = false;
    let disposed = false;
    const sync = () => {
      if (disposed) return;
      const disabled = motion.matches || navigator.connection?.saveData;
      const activePoster = mobile.matches && mobilePoster ? mobilePoster : poster;
      if (activePoster) video.poster = activePoster;
      if (disabled || document.hidden || !visible) {
        video.pause();
        if (disabled) {
          video.removeAttribute('src');
          activated = false;
          settle();
        }
        return;
      }
      const options = mobile.matches && mobileSources?.length ? mobileSources : sources;
      const chosen = options.find((s) => video.canPlayType(s.type || 'video/mp4')) || options[0];
      if (!chosen) { settle(); return; }
      if (!activated || video.getAttribute('src') !== chosen.src) {
        video.src = chosen.src;
        activated = true;
      }
      video.muted = true;
      video.play()?.catch(() => settle()); // Low-power mode keeps the poster usable.
    };
    let observer;
    if (pauseOffscreen && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: '140px' });
      observer.observe(video);
    } else visible = true;
    sync();
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pointerdown', sync, { passive: true });
    motion.addEventListener?.('change', sync);
    mobile.addEventListener?.('change', sync);
    return () => {
      disposed = true;
      observer?.disconnect();
      video.pause();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointerdown', sync);
      motion.removeEventListener?.('change', sync);
      mobile.removeEventListener?.('change', sync);
    };
  }, [sourceKey, mobileKey, poster, mobilePoster, maxMobile, eager, pauseOffscreen]);

  return <video {...rest} ref={ref} className={className} style={style}
    poster={poster || undefined} muted loop playsInline preload="none" disablePictureInPicture
    onLoadedData={settle} onError={() => { setFailed(true); settle(); }}
    data-failed={failed ? 'true' : undefined} />;
}
