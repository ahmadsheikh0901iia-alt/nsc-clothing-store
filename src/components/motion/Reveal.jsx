'use client';

import { createElement } from 'react';
import useInView from '@/hooks/useInView';
import { cn } from '@/lib/utils';

/**
 * Reveals its contents when scrolled into view.
 *
 * <Reveal>            rises 34px and fades in
 * <Reveal from="left">  slides in from the left
 * <Reveal delay={0.2}>  waits 200ms after entering
 * <Reveal as="h2">      renders an <h2> instead of a <div>
 * <Reveal mask>         uncovers an image from the bottom up
 *
 * All the actual movement lives in styles/motion.css — this component
 * only decides *when* to add the `is-in` class.
 */
export default function Reveal({
  as = 'div',
  from = 'up',
  delay = 0,
  y,
  mask = false,
  threshold = 0.18,
  once = true,
  className,
  style,
  children,
  ...rest
}) {
  const [ref] = useInView({ threshold, once });

  return createElement(
    as,
    {
      ref,
      className: cn(mask ? 'reveal-mask' : 'reveal', className),
      'data-from': mask ? undefined : from,
      style: {
        '--reveal-delay': `${delay}s`,
        ...(y != null ? { '--reveal-y': `${y}px` } : null),
        ...style,
      },
      ...rest,
    },
    children
  );
}
