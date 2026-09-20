'use client';

import { createElement } from 'react';
import useInView from '@/hooks/useInView';
import { cn } from '@/lib/utils';

/**
 * Cascades its direct children into view, one after another.
 *
 *   <Stagger className="grid-3">
 *     <ProductCard /> <ProductCard /> <ProductCard />
 *   </Stagger>
 *
 * No wrapper elements are added, so the children stay direct grid or
 * flex items and your layout is untouched.
 *
 * The per-child delay is worked out in CSS with :nth-child() rather
 * than by cloning each child to attach an index prop. Children passed
 * from a server component into a client component cannot reliably be
 * cloned, so doing it in CSS is the version that always works.
 *
 * @param {number} step  seconds between each child (default 0.075)
 */
export default function Stagger({
  as = 'div',
  className,
  step,
  threshold = 0.12,
  children,
  style,
  ...rest
}) {
  const [ref] = useInView({ threshold });

  return createElement(
    as,
    {
      ref,
      className: cn('stagger', className),
      style: step != null ? { '--stagger-step': `${step}s`, ...style } : style,
      ...rest,
    },
    children
  );
}
