'use client';

import Image from 'next/image';
import { useState } from 'react';
import { safeImageSource } from '@/lib/images';

/** Public Storage already serves these files over its CDN. Do not make their
 * availability depend on Vercel's separate image-transformation quota. Local
 * editorial images still use Next's responsive image optimiser. */
export default function StoreImage({ src, alt = '', onError, ...props }) {
  const source = safeImageSource(src);
  const [failed, setFailed] = useState('');
  const display = failed === source ? '/products/placeholder.jpg' : source;
  return (
    <Image
      {...props}
      src={display}
      alt={alt}
      unoptimized={display.startsWith('https://') || display === '/products/placeholder.jpg' || props.unoptimized}
      onError={(event) => {
        setFailed(source);
        onError?.(event);
      }}
    />
  );
}
