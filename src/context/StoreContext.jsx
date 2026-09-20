'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { lineId, primaryImage } from '@/lib/utils';
import { shippingFor } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
   STORE CONTEXT
   Holds the cart, the open/closed state of every overlay, and the
   toast queue. One provider wraps the whole app in app/layout.js.

   The cart persists to localStorage so a refresh doesn't lose it.
   ═══════════════════════════════════════════════════════════════ */

const StorageKey = 'nsc-cart-v1';

const StoreContext = createContext(null);

/* ── CART REDUCER ────────────────────────────────────────────── */

function cartReducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return Array.isArray(action.items) ? action.items : state;

    case 'add': {
      const { line } = action;
      const existing = state.find((l) => l.id === line.id);
      if (existing) {
        return state.map((l) =>
          l.id === line.id ? { ...l, qty: Math.min(l.qty + line.qty, 99) } : l
        );
      }
      return [...state, line];
    }

    case 'setQty': {
      if (action.qty <= 0) return state.filter((l) => l.id !== action.id);
      return state.map((l) =>
        l.id === action.id ? { ...l, qty: Math.min(action.qty, 99) } : l
      );
    }

    case 'remove':
      return state.filter((l) => l.id !== action.id);

    case 'clear':
      return [];

    default:
      return state;
  }
}

/* ── PROVIDER ────────────────────────────────────────────────── */

export function StoreProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  /* Read the saved cart once, on the client only. Doing this in an
     effect (not during render) keeps the server and client HTML
     identical, which is what stops React hydration warnings. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(StorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: 'hydrate', items: parsed });
      }
    } catch {
      /* private mode, disabled storage — carry on with an empty cart */
    }
    setHydrated(true);
  }, []);

  /* Write it back whenever it changes. */
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(StorageKey, JSON.stringify(items));
    } catch {
      /* over quota or blocked — the cart still works for this session */
    }
  }, [items, hydrated]);

  /* Close every overlay when the Escape key is pressed. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setCartOpen(false);
      setMenuOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── TOASTS ── */

  const toast = useCallback((message) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t, { id, message }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  /* ── CART ACTIONS ── */

  const addItem = useCallback(
    (product, { size = null, color = null, qty = 1 } = {}) => {
      const id = lineId(product.id, size, color);
      dispatch({
        type: 'add',
        line: {
          id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: Number(product.price) || 0,
          image: primaryImage(product),
          category: product.category,
          size,
          color,
          qty: Math.max(1, qty),
        },
      });
      toast(`${product.name} added to bag`);
      setCartOpen(true);
    },
    [toast]
  );

  const setQty = useCallback((id, qty) => dispatch({ type: 'setQty', id, qty }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), []);

  /* ── DERIVED TOTALS ── */

  const totals = useMemo(() => {
    const count = items.reduce((n, l) => n + l.qty, 0);
    const subtotal = items.reduce((n, l) => n + l.price * l.qty, 0);
    const shipping = shippingFor(subtotal);
    return { count, subtotal, shipping, total: subtotal + shipping };
  }, [items]);

  /* Opening one overlay closes the others — never two at once. */
  const openCart = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(true);
  }, []);
  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setCartOpen(false);
    setSearchOpen(true);
  }, []);
  const openMenu = useCallback(() => {
    setCartOpen(false);
    setSearchOpen(false);
    setMenuOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      items,
      hydrated,
      ...totals,
      addItem,
      setQty,
      removeItem,
      clearCart,
      cartOpen,
      setCartOpen,
      openCart,
      menuOpen,
      setMenuOpen,
      openMenu,
      searchOpen,
      setSearchOpen,
      openSearch,
      toasts,
      toast,
    }),
    [
      items,
      hydrated,
      totals,
      addItem,
      setQty,
      removeItem,
      clearCart,
      cartOpen,
      openCart,
      menuOpen,
      openMenu,
      searchOpen,
      openSearch,
      toasts,
      toast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** Reads the store. Throws a clear message if used outside the provider. */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore() must be used inside <StoreProvider>. Check app/layout.js.');
  }
  return ctx;
}

export default StoreContext;
