'use client';

import { useStore } from '@/context/StoreContext';
import { CheckIcon } from '@/components/ui/Icons';

/**
 * Small confirmations ("added to bag"). Announced politely to screen
 * readers, and never blocking — they cannot be clicked through.
 */
export default function Toasts() {
  const { toasts } = useStore();

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <CheckIcon width={16} height={16} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
