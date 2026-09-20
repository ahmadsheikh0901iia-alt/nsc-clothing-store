'use client';

import { createElement } from 'react';
import useScrollProgress from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

/**
 * Wraps a section and publishes its scroll progress as the CSS variable
 * `--p` (0 → 1). Every descendant can read it, so a whole scene can be
 * animated purely in CSS from a single number.
 *
 *   <ScrollScene mode="pin" className="lookbook">
 *     <div className="lookbook-pin"> … </div>
 *   </ScrollScene>
 *
 * See hooks/useScrollProgress.js for what 'cover' and 'pin' mean.
 */
export default function ScrollScene({
  as = 'section',
  mode = 'cover',
  className,
  children,
  ...rest
}) {
  const ref = useScrollProgress(mode);

  return createElement(
    as,
    { ref, className: cn(className), ...rest },
    children
  );
}
