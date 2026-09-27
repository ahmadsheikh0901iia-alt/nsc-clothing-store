'use client';

import { createElement } from 'react';
import useInView from '@/hooks/useInView';
import { cn } from '@/lib/utils';

/**
 * Reveals its contents when scrolled into view.
 *
 * <Reveal>              rises 34px and fades in
 * <Reveal from="left">    slides in from the left
 * <Reveal delay={0.2}>    waits 200ms after entering
 * <Reveal as="h2">        renders an <h2> instead of a <div>
 * <Reveal mask>           uncovers an image from the bottom up
 * <Reveal enter={0.66}>   waits until it is two-thirds up the screen
 *
 * `enter` is the one that matters for a big photograph. By default a
 * reveal fires as soon as its top edge crosses 92% of the viewport
 * height — which for a wide plate means the whole two-second uncover
 * plays while the picture is still a sliver at the bottom of the
 * screen, and by the time you have scrolled to it, it is simply
 * there. A lower `enter` holds the animation back until the picture
 * is somewhere a person is actually looking.
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
  enter = 0.92,
  once = true,
  className,
  style,
  children,
  ...rest
}) {
  const [ref] = useInView({ threshold, enter, once });

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
