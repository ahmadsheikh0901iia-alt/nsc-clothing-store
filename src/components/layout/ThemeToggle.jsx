'use client';

import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from '@/components/ui/Icons';

/**
 * Light / dark switch.
 *
 * Two shapes from one component:
 *
 *  · `variant="icon"`     a single hairline button for the header —
 *                         the sun and the moon are stacked and cross
 *                         over each other, so the change reads as one
 *                         object turning rather than two icons swapping.
 *
 *  · `variant="segment"`  a labelled two-up control for the mobile
 *                         menu, where there is room to say the words
 *                         and a bare icon would be a guess.
 *
 * Which icon shows is decided in CSS from `<html data-theme>`, not
 * from React state. That attribute is stamped by the inline script in
 * app/layout.js before the first paint, so the button is already
 * correct on the server-rendered HTML and there is no moment where it
 * renders blank or shows the wrong icon while waiting for hydration.
 * React state here only drives the click and the accessible label.
 */
export default function ThemeToggle({ variant = 'icon', tabIndex }) {
  const { resolved, ready, setTheme, toggle } = useTheme();
  const isLight = resolved === 'light';

  if (variant === 'segment') {
    return (
      <div className="theme-seg" role="group" aria-label="Colour theme">
        <button
          type="button"
          className="theme-seg-btn"
          data-for="light"
          aria-pressed={ready ? isLight : undefined}
          onClick={() => setTheme('light')}
          tabIndex={tabIndex}
        >
          <SunIcon width={15} height={15} />
          Light
        </button>
        <button
          type="button"
          className="theme-seg-btn"
          data-for="dark"
          aria-pressed={ready ? !isLight : undefined}
          onClick={() => setTheme('dark')}
          tabIndex={tabIndex}
        >
          <MoonIcon width={15} height={15} />
          Dark
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="icon-btn theme-btn"
      onClick={toggle}
      title={isLight ? 'Switch to dark' : 'Switch to light'}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span className="theme-btn-stack" aria-hidden="true">
        <SunIcon className="theme-ico theme-ico-sun" />
        <MoonIcon className="theme-ico theme-ico-moon" />
      </span>
    </button>
  );
}
