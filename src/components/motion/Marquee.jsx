'use client';

import useOnScreen from '@/hooks/useOnScreen';
import { cn } from '@/lib/utils';

/**
 * An infinite horizontal ribbon.
 *
 * The trick: the content is rendered twice inside a track, and the
 * track is translated by exactly -50%. At the moment the animation
 * restarts, copy two sits precisely where copy one began, so the loop
 * has no visible seam. Pure CSS — it never touches the main thread.
 *
 * Hovering pauses it, so a visitor can actually read a statement.
 *
 * Aur jab patti screen par hoti hi nahi, tab bhi ruk jati hai —
 * `data-run` hooks/useOnScreen.js se aata hai. Ek chalti hui
 * animation browser se har frame par kaam karati hai chahe use
 * koi dekh raha ho ya na ho; safhe ke neeche baithi teen pattiyan
 * poore scroll ko bhaari kar deti theen.
 */
export default function Marquee({
  items = [],
  duration = 44,
  reverse = false,
  className,
  renderItem,
}) {
  const content = (keyPrefix) =>
    items.map((item, i) => (
      <span className="ribbon-item" key={`${keyPrefix}-${i}`}>
        {renderItem ? renderItem(item, i) : item}
        <span className="sep" aria-hidden="true">
          ✦
        </span>
      </span>
    ));

  const ref = useOnScreen();

  return (
    <div className={cn('marquee', className)} ref={ref} data-run="true">
      <div
        className="marquee-track"
        data-direction={reverse ? 'reverse' : undefined}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        {/* Copy one is read by screen readers… */}
        <div style={{ display: 'flex' }}>{content('a')}</div>
        {/* …copy two is decorative, so it is hidden from them. */}
        <div style={{ display: 'flex' }} aria-hidden="true">
          {content('b')}
        </div>
      </div>
    </div>
  );
}
