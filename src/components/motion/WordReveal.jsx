'use client';

import { createElement, Fragment } from 'react';
import useInView from '@/hooks/useInView';
import { cn } from '@/lib/utils';

/**
 * Reveals a headline one word at a time — each word swings up from
 * inside its own clipped line box, 60ms after the word before it.
 *
 * Pass the text as a plain string:
 *   <WordReveal as="h1" text="Cloth, cut with intent" />
 *
 * To colour part of the line, split it into segments:
 *   <WordReveal
 *     as="h1"
 *     segments={[{ text: 'Cloth, cut' }, { text: 'with intent', em: true }]}
 *   />
 *
 * `em` renders that segment in italic gold, which is the accent the
 * whole site uses for emphasis.
 */
export default function WordReveal({
  as = 'h2',
  text = '',
  segments,
  delay = 0,
  step = 0.06,
  className,
  style,
  ...rest
}) {
  const [ref] = useInView({ threshold: 0.25 });

  // Normalise both input styles into one list of { word, em } entries.
  const parts = segments
    ? segments.flatMap((seg, si) =>
        String(seg.text)
          .split(' ')
          .filter(Boolean)
          .map((word) => ({ word, em: Boolean(seg.em), key: `${si}` }))
      )
    : String(text)
        .split(' ')
        .filter(Boolean)
        .map((word) => ({ word, em: false, key: '0' }));

  return createElement(
    as,
    { ref, className: cn('words', className), style, ...rest },
    parts.map((part, i) => (
      <Fragment key={`${part.key}-${i}-${part.word}`}>
        <span className="word">
          <span style={{ '--word-delay': `${delay + i * step}s` }}>
            {part.em ? <em>{part.word}</em> : part.word}
          </span>
        </span>
        {i < parts.length - 1 ? ' ' : null}
      </Fragment>
    ))
  );
}
