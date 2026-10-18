'use client';

import Image from 'next/image';
import { useState } from 'react';
import { safeImageSource } from '@/lib/images';

/**
 * ── TASVEER KA MAHFOOL RASTA ──────────────────────────────────
 * 1. Jo URL diya gaya hai, wahi — local file optimizer ke through,
 *    bahri tasveer seedha apne CDN se.
 * 2. Agar optimizer ne haath tani di (koi width ya quality jo
 *    list mein nahi), to ASLI FILE seedhi try hoti hai. Matlab
 *    tasveer kabhi "khatam" nahi hoti, sirf resizing nahi hoti.
 * 3. Sirf tab placeholder, jab URL sach mein kharab hai.
 *
 * Public Storage apne hi CDN par files deta hai — unhein Vercel ke
 * alag image-transformation quota par depend nahi rakhna chahiye.
 */
export default function StoreImage({ src, alt = '', onError, ...props }) {
  const source = safeImageSource(src);
  const [stage, setStage] = useState(0);

  const external = /^https:\/\//i.test(source);
  const isPlaceholder = source === '/products/placeholder.jpg';

  /* 0 = seedha, 1 = asli file, 2 = placeholder */
  const display =
    stage === 2 ? '/products/placeholder.jpg' : source;

  const unoptimized =
    external || isPlaceholder || stage > 0 || Boolean(props.unoptimized);

  return (
    <Image
      {...props}
      src={display}
      alt={alt}
      unoptimized={unoptimized}
      onError={(event) => {
        /* Bahri tasveer pehle hi seedhi hai — uska koi doosra
           raw roos nahi. Wahan seedha placeholder. */
        setStage((current) => (external || isPlaceholder || current > 0 ? 2 : 1));
        onError?.(event);
      }}
    />
  );
}
