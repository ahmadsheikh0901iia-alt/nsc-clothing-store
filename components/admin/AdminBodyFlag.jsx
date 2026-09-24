'use client';

import { useEffect } from 'react';

/**
 * Admin ke safhe par <body> par ek nishan laga deta hai:
 *
 *     <body data-admin="true">
 *
 * Kyun zaroorat parti hai: admin.css header, footer aur neeche ke
 * gol button `body:has(.admin-root)` se chhupata hai. `:has()` ek
 * nayi cheez hai — Chrome 105 aur Safari 15.4 se pehle wale phone
 * use samajhte hi nahi, aur jab ek qatar samajh na aaye to browser
 * POORA block chhor deta hai. Un phone par admin panel ke upar
 * poora header aa baithta tha aur kuch kaam nahi hota tha.
 *
 * Ye nishan har browser par lagta hai — 2017 ka phone ho ya aaj
 * ka. Chhupane ka asal kaam compat.css mein isi nishan se hota
 * hai. `:has()` wali purani qatar bhi apni jagah hai; jahan chale,
 * chalti rahe — dono ek hi baat karti hain.
 */
export default function AdminBodyFlag() {
  useEffect(() => {
    document.body.dataset.admin = 'true';
    return () => {
      delete document.body.dataset.admin;
    };
  }, []);

  return null;
}
