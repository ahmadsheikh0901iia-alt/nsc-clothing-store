'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPKR, STORE } from '@/lib/constants';
import { ORDER_STATUSES, getStatus } from '@/lib/order-status';
import OrderCard from '@/components/admin/OrderCard';
import ProductForm from '@/components/admin/ProductForm';
import WhatsAppShare from '@/components/shop/WhatsAppShare';
import {
  ArrowUpRight,
  CheckIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ADMIN PANEL
 *  ─────────────────────────────────────────────────────────────
 *  Teen hisse: Orders, Products, Inbox.
 *
 *  Panel har pentalees second baad khud taza ho jata hai, aur
 *  naye order par upar ginti badal jati hai — dukaan chalate
 *  hue baar baar refresh dabana nahi parta. Jab aap koi khana
 *  bhar rahe hon ya form khula ho, to khud-taza hona ruk jata
 *  hai, taake aap ka likha hua kabhi na ure.
 *
 *  Har tabdeeli pehle screen par dikhti hai aur sath sath server
 *  par jati hai. Server ne na mana to screen wapas asal halat
 *  par chali jati hai aur wajah saaf likhi jati hai — chup chaap
 *  kuch nahi hota.
 * ═══════════════════════════════════════════════════════════════
 */

const TABS = [
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'inbox', label: 'Inbox' },
];

const REFRESH_MS = 45000;

export default function AdminPanel() {
  const router = useRouter();

  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  /* ── Poochne wala khana ──
     `window.confirm` browser ka apna daira hai: na is par dukaan
     ka rang chalta hai, na phone par wo theek lagta hai, aur kuch
     browser use rok bhi dete hain. Ab apna khana hai. Shakl:
     { title, body, confirmLabel, onConfirm } */
  const [confirming, setConfirming] = useState(null);

  /* Product save hone ke baad — WhatsApp ka tayyar paighaam. */
  const [shareProduct, setShareProduct] = useState(null);

  /* Daire `document.body` mein bheje jate hain, kyunke har safha
     ek animation wale khol ke andar hota hai aur us par transform
     lagta hai — aur transform wala baap `position: fixed` ka
     matlab apne hisaab se badal deta hai. Server par portal nahi
     banta, is liye ye nishan. */
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  /* Orders */
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);

  /* Products */
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | {} | product
  const [loadingProducts, setLoadingProducts] = useState(false);

  /* Inbox */
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  const [refreshedAt, setRefreshedAt] = useState(null);
  const typing = useRef(false);

  /* ── Toast ── */
  const say = useCallback((message, tone = 'ok') => {
    setToast({ message, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  }, []);

  /* ── Login khatam ho jaye to wapas login par ── */
  const guard = useCallback(
    (res) => {
      if (res.status === 401) {
        router.refresh();
        return true;
      }
      return false;
    },
    [router]
  );

  /* ── Orders ── */
  const loadOrders = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoadingOrders(true);
      try {
        const params = new URLSearchParams();
        if (orderFilter) params.set('status', orderFilter);
        if (orderQuery.trim()) params.set('q', orderQuery.trim());

        const res = await fetch(`/api/admin/orders?${params}`, { cache: 'no-store' });
        if (guard(res)) return;

        const data = await res.json().catch(() => ({}));
        if (data.ok) {
          setOrders(data.orders);
          setStats(data.stats || {});
          setRefreshedAt(Date.now());
        }
      } catch {
        if (!quiet) say('Could not load orders.', 'error');
      } finally {
        setLoadingOrders(false);
      }
    },
    [orderFilter, orderQuery, guard, say]
  );

  const patchOrder = useCallback(
    async (orderNumber, patch) => {
      // Pehle screen par — intezar kiye baghair.
      const before = orders;
      if (patch.status) {
        setOrders((list) =>
          list.map((o) => (o.order_number === orderNumber ? { ...o, status: patch.status } : o))
        );
      }

      try {
        const res = await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber, ...patch }),
        });
        if (guard(res)) return { ok: false };

        const data = await res.json().catch(() => ({}));

        if (!data.ok) {
          setOrders(before);
          if (data.error === 'not_enough_stock') {
            say(`Not enough stock left${data.name ? ` — ${data.name}` : ''}.`, 'error');
          } else {
            say('That change did not go through.', 'error');
          }
          return data;
        }

        if (data.order) {
          setOrders((list) =>
            list.map((o) => (o.order_number === orderNumber ? data.order : o))
          );
        }
        if (data.stats) setStats(data.stats);

        if (patch.status) {
          say(`${orderNumber} — ${getStatus(patch.status).label}`);
        }

        return { ok: true, order: data.order };
      } catch {
        setOrders(before);
        say('Could not reach the server.', 'error');
        return { ok: false };
      }
    },
    [orders, guard, say]
  );

  /* ── Cancelled order mitana ──
     Server par teen taalay hain (dekhein api/admin/orders ka
     DELETE): admin ka login, order ka status khud dobara parhna,
     aur audit. Yahan ka kaam sirf poochhna aur list seedhi rakhna
     hai. Delete ka button bhi sirf cancelled par dikhta hai —
     magar wo aap ki aasani hai, hifazat nahi; hifazat server par
     hai. */

  const runDeleteOrder = useCallback(
    async (order) => {
      const before = orders;
      // Pehle screen par — intezar kiye baghair.
      setOrders((list) => list.filter((o) => o.order_number !== order.order_number));

      try {
        const res = await fetch(
          `/api/admin/orders?order=${encodeURIComponent(order.order_number)}`,
          { method: 'DELETE' }
        );
        if (guard(res)) {
          setOrders(before);
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (!data.ok) {
          setOrders(before);
          if (data.error === 'not_cancelled') {
            say('Only cancelled orders can be deleted.', 'error');
          } else if (data.error === 'not_found') {
            say('That order is no longer there.', 'error');
          } else {
            say('Could not delete that order.', 'error');
          }
          return;
        }

        if (data.stats) setStats(data.stats);
        say(`${order.order_number} deleted.`);
      } catch {
        setOrders(before);
        say('Could not reach the server.', 'error');
      }
    },
    [orders, guard, say]
  );

  /* Poochna pehle, mitana baad mein. */
  const deleteOrder = useCallback(
    (order) => {
      setConfirming({
        title: `Delete order ${order.order_number}?`,
        body:
          `${order.customer_name || 'No name'} — this order disappears from the ` +
          `panel and cannot be brought back from here. The deletion is recorded ` +
          `in the audit log.`,
        confirmLabel: 'Delete order',
        onConfirm: () => runDeleteOrder(order),
      });
    },
    [runDeleteOrder]
  );

  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const runClearCancelled = useCallback(async () => {
    const before = orders;
    setOrders((list) => list.filter((o) => o.status !== 'cancelled'));

    try {
      const res = await fetch('/api/admin/orders?all=cancelled', { method: 'DELETE' });
      if (guard(res)) {
        setOrders(before);
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!data.ok) {
        setOrders(before);
        say('Could not clear those orders.', 'error');
        return;
      }

      if (data.stats) setStats(data.stats);
      say(`${data.count} cancelled order${data.count === 1 ? '' : 's'} deleted.`);
    } catch {
      setOrders(before);
      say('Could not reach the server.', 'error');
    }
  }, [orders, guard, say]);

  const clearCancelled = useCallback(() => {
    const count = orders.filter((o) => o.status === 'cancelled').length;
    if (count === 0) {
      say('There are no cancelled orders.', 'error');
      return;
    }
    setConfirming({
      title: `Delete all ${count} cancelled order${count === 1 ? '' : 's'}?`,
      body:
        `They disappear from the panel and cannot be brought back from here. ` +
        `The deletion is recorded in the audit log.`,
      confirmLabel: `Delete ${count}`,
      onConfirm: () => runClearCancelled(),
    });
  }, [orders, say, runClearCancelled]);

  /* ── Products ── */
  const loadProducts = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        if (productQuery.trim()) params.set('q', productQuery.trim());

        const res = await fetch(`/api/admin/products?${params}`, { cache: 'no-store' });
        if (guard(res)) return;

        const data = await res.json().catch(() => ({}));
        if (data.ok) setProducts(data.products);
      } catch {
        if (!quiet) say('Could not load products.', 'error');
      } finally {
        setLoadingProducts(false);
      }
    },
    [productQuery, guard, say]
  );

  const saveProduct = useCallback(
    async (payload, id) => {
      try {
        const res = await fetch('/api/admin/products', {
          method: id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(id ? { ...payload, id } : payload),
        });
        if (guard(res)) return { ok: false };

        const data = await res.json().catch(() => ({}));
        if (!data.ok) return data;

        setProducts((list) =>
          id ? list.map((p) => (p.id === id ? data.product : p)) : [data.product, ...list]
        );
        setEditing(null);
        say(id ? 'Product saved.' : 'Product added — it is live on the site.');

        /* Save hote hi WhatsApp ka paighaam tayyar. Khulta hai,
           bhejta nahi — bhejne ka faisla hamesha aap ka. */
        if (data.product) setShareProduct(data.product);

        loadOrders({ quiet: true });
        return { ok: true };
      } catch {
        return { ok: false, message: 'Could not reach the server.' };
      }
    },
    [guard, say, loadOrders]
  );

  const quickToggle = useCallback(
    async (product, field) => {
      const next = !product[field];
      setProducts((list) =>
        list.map((p) => (p.id === product.id ? { ...p, [field]: next } : p))
      );

      try {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.id, [field]: next }),
        });
        if (guard(res)) return;

        const data = await res.json().catch(() => ({}));
        if (!data.ok) {
          setProducts((list) =>
            list.map((p) => (p.id === product.id ? { ...p, [field]: product[field] } : p))
          );
          say('That did not work.', 'error');
        }
      } catch {
        setProducts((list) =>
          list.map((p) => (p.id === product.id ? { ...p, [field]: product[field] } : p))
        );
      }
    },
    [guard, say]
  );

  const runDeleteProduct = useCallback(
    async (product) => {

      try {
        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
          method: 'DELETE',
        });
        if (guard(res)) return;

        const data = await res.json().catch(() => ({}));
        if (data.ok) {
          setProducts((list) => list.filter((p) => p.id !== product.id));
          say('Product deleted.');
        } else {
          say('Could not delete that.', 'error');
        }
      } catch {
        say('Could not reach the server.', 'error');
      }
    },
    [guard, say]
  );

  /* Product mitana bhi ab usi poochne wale khane se guzarta hai —
     brief ki shart: har mitane wala kaam pehle poochta hai. */
  const deleteProduct = useCallback(
    (product) => {
      setConfirming({
        title: `Delete “${product.name}”?`,
        body:
          'If you only want it off the site, switch off “Show on the site” ' +
          'instead — that way the name stays readable in old orders. ' +
          'Deleting is recorded in the audit log.',
        confirmLabel: 'Delete product',
        onConfirm: () => runDeleteProduct(product),
      });
    },
    [runDeleteProduct]
  );

  /* ── Inbox ── */
  const loadInbox = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoadingInbox(true);
      try {
        const res = await fetch('/api/admin/inbox', { cache: 'no-store' });
        if (guard(res)) return;

        const data = await res.json().catch(() => ({}));
        if (data.ok) {
          setMessages(data.messages || []);
          setSubscribers(data.subscribers || []);
        }
      } catch {
        if (!quiet) say('Could not load the inbox.', 'error');
      } finally {
        setLoadingInbox(false);
      }
    },
    [guard, say]
  );

  const markHandled = useCallback(
    async (id, handled) => {
      setMessages((list) => list.map((m) => (m.id === id ? { ...m, handled } : m)));
      try {
        await fetch('/api/admin/inbox', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, handled }),
        });
      } catch {
        /* agli refresh par theek ho jayega */
      }
    },
    []
  );

  /* ── Pehli dafa, aur filter badalne par ──
     Likhte waqt har harf par request nahi jati: teen sau
     millisecond ruk kar jati hai, jab aap likhna rok dein. */
  useEffect(() => {
    const wait = orderQuery.trim() ? 320 : 0;
    const t = window.setTimeout(() => loadOrders(), wait);
    return () => window.clearTimeout(t);
  }, [loadOrders, orderQuery]);

  useEffect(() => {
    if (tab !== 'products') return undefined;
    const wait = productQuery.trim() ? 320 : 0;
    const t = window.setTimeout(() => loadProducts(), wait);
    return () => window.clearTimeout(t);
  }, [tab, loadProducts, productQuery]);

  useEffect(() => {
    if (tab === 'inbox') loadInbox();
  }, [tab, loadInbox]);

  /* ── Khud taza hona ──
     Form khula ho ya aap kuch likh rahe hon to ruk jata hai. */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden || editing || typing.current) return;
      loadOrders({ quiet: true });
      if (tab === 'inbox') loadInbox({ quiet: true });
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [loadOrders, loadInbox, tab, editing]);

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.refresh();
  };

  const counts = useMemo(
    () => ({
      pending: stats.orders_pending ?? 0,
      active: stats.orders_active ?? 0,
      today: stats.orders_today ?? 0,
      revenue: stats.revenue_all ?? 0,
      live: stats.products_live ?? 0,
      out: stats.products_out ?? 0,
      low: stats.products_low ?? 0,
      subs: stats.subscribers ?? 0,
      newMessages: stats.messages_new ?? 0,
    }),
    [stats]
  );

  return (
    <div className="ad">
      {/* ══ Sar ══ */}
      <header className="ad-head">
        <div className="ad-head-in">
          <div>
            <p className="ad-eyebrow">{STORE.name}</p>
            <h1 className="ad-title">Admin</h1>
          </div>

          <div className="ad-head-right">
            <span className="ad-refreshed">
              {refreshedAt
                ? `updated ${new Date(refreshedAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : ''}
            </span>

            <button
              type="button"
              className="ad-icon-btn"
              onClick={() => {
                loadOrders();
                if (tab === 'products') loadProducts();
                if (tab === 'inbox') loadInbox();
              }}
              aria-label="Refresh now"
              title="Refresh now"
            >
              <RefreshIcon width={16} height={16} />
            </button>

            <Link href="/" className="ad-btn ad-btn-ghost" target="_blank">
              View site
              <ArrowUpRight width={14} height={14} />
            </Link>

            <button type="button" className="ad-btn ad-btn-ghost" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>

        {/* ══ Numbers ══ */}
        <div className="ad-stats">
          <Stat label="New orders" value={counts.pending} tone={counts.pending > 0 ? 'warn' : null} />
          <Stat label="In progress" value={counts.active} />
          <Stat label="Today" value={counts.today} />
          <Stat label="Revenue" value={formatPKR(counts.revenue)} wide />
          <Stat label="Live products" value={counts.live} />
          <Stat
            label="Out of stock"
            value={counts.out}
            tone={counts.out > 0 ? 'error' : null}
          />
          <Stat label="Low stock" value={counts.low} tone={counts.low > 0 ? 'warn' : null} />
          <Stat label="On the list" value={counts.subs} />
        </div>

        {/* ══ Tabs ══ */}
        <nav className="ad-tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className="ad-tab"
              aria-current={tab === t.key ? 'page' : undefined}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'orders' && counts.pending > 0 && (
                <span className="ad-badge">{counts.pending}</span>
              )}
              {t.key === 'inbox' && counts.newMessages > 0 && (
                <span className="ad-badge">{counts.newMessages}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="ad-main">
        {/* ══════════ ORDERS ══════════ */}
        {tab === 'orders' && (
          <section>
            <div className="ad-toolbar">
              <div className="ad-chips">
                <button
                  type="button"
                  className="ad-chip"
                  aria-pressed={orderFilter === ''}
                  onClick={() => setOrderFilter('')}
                >
                  All
                </button>
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className="ad-chip"
                    aria-pressed={orderFilter === s.key}
                    onClick={() => setOrderFilter(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="ad-search">
                <SearchIcon width={15} height={15} />
                <input
                  className="ad-input"
                  placeholder="Order number, name, phone, city…"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  onFocus={() => { typing.current = true; }}
                  onBlur={() => { typing.current = false; }}
                  aria-label="Search orders"
                />
              </div>

              {/* Sab cancelled ek sath. Jaan boojh kar sirf tab
                  dikhta hai jab aap Cancelled ki chaan laga chuke
                  hon — us waqt aap ki nazar ke saamne wohi list
                  hoti hai jo mitne ja rahi hai. Har waqt dikhta
                  rehta to ek ghalat click bohat mehnga parta. */}
              {orderFilter === 'cancelled' && cancelledCount > 0 && (
                <button
                  type="button"
                  className="ad-btn ad-btn-danger"
                  onClick={clearCancelled}
                  title="Delete every cancelled order for good"
                >
                  <TrashIcon width={14} height={14} />
                  Clear all cancelled ({cancelledCount})
                </button>
              )}
            </div>

            {loadingOrders && orders.length === 0 ? (
              <Skeleton rows={3} />
            ) : orders.length === 0 ? (
              <Empty
                title={orderFilter || orderQuery ? 'Nothing found' : 'No orders yet'}
                body={
                  orderFilter || orderQuery
                    ? 'Clear the filter and look again.'
                    : 'The moment your first order arrives it appears here at the top — and you get a Telegram or email alert.'
                }
              />
            ) : (
              <div className="ad-orders">
                {orders.map((order, i) => (
                  <OrderCard
                    key={order.order_number}
                    order={order}
                    onPatch={patchOrder}
                    onDelete={deleteOrder}
                    defaultOpen={i === 0 && order.status === 'pending'}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══════════ PRODUCTS ══════════ */}
        {tab === 'products' && (
          <section>
            <div className="ad-toolbar">
              <button
                type="button"
                className="ad-btn ad-btn-gold"
                onClick={() => setEditing({})}
              >
                <PlusIcon width={15} height={15} />
                New product
              </button>

              <div className="ad-search">
                <SearchIcon width={15} height={15} />
                <input
                  className="ad-input"
                  placeholder="Name or slug…"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onFocus={() => { typing.current = true; }}
                  onBlur={() => { typing.current = false; }}
                  aria-label="Search products"
                />
              </div>
            </div>

            {loadingProducts && products.length === 0 ? (
              <Skeleton rows={4} />
            ) : products.length === 0 ? (
              <Empty
                title="The shelf is empty"
                body="Add your first product — the site's “Arriving soon” panel disappears by itself and the Featured grid comes back."
              />
            ) : (
              <div className="ad-products">
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => setEditing(product)}
                    onToggle={quickToggle}
                    onDelete={deleteProduct}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══════════ INBOX ══════════ */}
        {tab === 'inbox' && (
          <section className="ad-inbox">
            <div>
              <p className="ad-block-title">Paighamat</p>

              {loadingInbox && messages.length === 0 ? (
                <Skeleton rows={2} />
              ) : messages.length === 0 ? (
                <Empty title="No messages" body="Messages from the contact form arrive here." />
              ) : (
                <ul className="ad-messages">
                  {messages.map((m) => (
                    <li key={m.id} data-handled={m.handled ? 'true' : 'false'}>
                      <div className="ad-message-head">
                        <span className="ad-message-who">
                          {m.name}
                          {m.phone && (
                            <a
                              className="ad-link ad-num"
                              href={`https://wa.me/${String(m.phone).replace(/\D/g, '').replace(/^0/, '92')}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {m.phone}
                            </a>
                          )}
                        </span>
                        <span className="ad-message-subject">{m.subject}</span>
                      </div>
                      <p className="ad-message-body">{m.body}</p>
                      <button
                        type="button"
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        onClick={() => markHandled(m.id, !m.handled)}
                      >
                        {m.handled ? 'Reopen' : 'Done'}
                        {m.handled && <CheckIcon width={12} height={12} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="ad-block-title">Newsletter — {subscribers.length}</p>

              {subscribers.length === 0 ? (
                <Empty title="Nobody yet" body="Emails from the footer form collect here." />
              ) : (
                <>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-sm"
                    onClick={() => {
                      navigator.clipboard
                        ?.writeText(subscribers.map((s) => s.email).join(', '))
                        .then(() => say('All emails copied.'))
                        .catch(() => say('Could not copy.', 'error'));
                    }}
                  >
                    Copy all
                  </button>
                  <ul className="ad-subs">
                    {subscribers.map((s) => (
                      <li key={s.id}>
                        <span>{s.email}</span>
                        <span className="ad-subs-date">
                          {new Date(s.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ══ Product ka form ══ */}
      {editing && (
        <div className="ad-sheet" role="dialog" aria-modal="true" aria-label="Product">
          <button
            type="button"
            className="ad-sheet-scrim"
            onClick={() => setEditing(null)}
            aria-label="Close"
          />
          <div className="ad-sheet-panel">
            <ProductForm
              product={editing.id ? editing : null}
              onSave={saveProduct}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {/* ══ Poochne wala khana ══
          `document.body` mein, taake safhe ke animation wale khol
          ka transform is ke `fixed` par asar na kare. */}
      {confirming && portalReady &&
        createPortal(
          <ConfirmDialog
            {...confirming}
            onCancel={() => setConfirming(null)}
            onConfirm={() => {
              const run = confirming.onConfirm;
              setConfirming(null);
              run?.();
            }}
          />,
          document.body
        )}

      {/* ══ Product save hone ke baad — WhatsApp ka paighaam ══
          Khud nahi bhejta. Paighaam dikhta hai, aur WhatsApp tab
          khulta hai jab aap kehte hain. */}
      <WhatsAppShare
        product={shareProduct}
        open={Boolean(shareProduct)}
        onClose={() => setShareProduct(null)}
        hint="Saved. Here is the ready message — check it, then open WhatsApp."
      />

      {/* ══ Toast ══ */}
      <div className="ad-toasts" aria-live="polite">
        {toast && <div className={`ad-toast ad-toast-${toast.tone}`}>{toast.message}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POOCHNE WALA KHANA
   ───────────────────────────────────────────────────────────────
   Mitane se pehle hamesha ye. Teen baatein jaan boojh kar:

   · Khulte hi focus "Cancel" par jata hai, "Delete" par nahi —
     taake jaldi mein Enter dabane se kuch mit na jaye.
   · Escape band kar deta hai.
   · Bahar chhoona bhi band kar deta hai, magar sirf tab jab ungli
     waqai bahar uthi ho — andar se shuru ho kar bahar khatam hone
     wali harkat khana band nahi karti.
   ═══════════════════════════════════════════════════════════════ */
function ConfirmDialog({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => cancelRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [onCancel]);

  return (
    <div
      className="ad-ask-veil"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="ad-ask" role="alertdialog" aria-modal="true" aria-labelledby="ad-ask-t">
        <h2 id="ad-ask-t">{title}</h2>
        <p>{body}</p>
        <div className="ad-ask-row">
          <button type="button" className="ad-btn ad-btn-ghost" onClick={onCancel} ref={cancelRef}>
            Cancel
          </button>
          <button type="button" className="ad-btn ad-btn-danger" onClick={onConfirm}>
            <TrashIcon width={14} height={14} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Chhote tukre ─────────────────────────────────────────────── */

function Stat({ label, value, tone, wide }) {
  return (
    <div className="ad-stat" data-tone={tone || undefined} data-wide={wide ? 'true' : undefined}>
      <span className="ad-stat-v ad-num">{value}</span>
      <span className="ad-stat-k">{label}</span>
    </div>
  );
}

function Empty({ title, body }) {
  return (
    <div className="ad-empty">
      <p className="ad-empty-title">{title}</p>
      <p className="ad-empty-body">{body}</p>
    </div>
  );
}

function Skeleton({ rows = 3 }) {
  return (
    <div className="ad-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.09}s` }} />
      ))}
    </div>
  );
}

function ProductRow({ product, onEdit, onToggle, onDelete }) {
  const cover = Array.isArray(product.images) ? product.images[0] : null;
  const stock = product.stock_count;
  const out = product.in_stock === false || stock === 0;
  const low = !out && typeof stock === 'number' && stock > 0 && stock <= 3;

  return (
    <article className="ad-product" data-dim={product.published ? undefined : 'true'}>
      <div className="ad-product-shot">
        {cover ? (
          <Image src={cover} alt="" width={120} height={160} sizes="60px" unoptimized />
        ) : (
          <span className="ad-product-noshot" aria-hidden="true" />
        )}
      </div>

      <div className="ad-product-main">
        <p className="ad-product-name">{product.name}</p>
        <p className="ad-product-meta ad-mono">
          /shop/{product.slug} · {product.category}
        </p>

      </div>

      <div className="ad-product-price">
        <span className="ad-num">{formatPKR(product.price)}</span>
        {product.compare_at_price > product.price && (
          <span className="ad-was ad-num">{formatPKR(product.compare_at_price)}</span>
        )}
      </div>

      <div className="ad-product-stock">
        {out ? (
          <span className="ad-pill ad-pill-error">Khatam</span>
        ) : low ? (
          <span className="ad-pill ad-pill-warn">{stock} bachi</span>
        ) : (
          <span className="ad-pill ad-pill-quiet ad-num">
            {stock === null || stock === undefined ? '∞' : stock}
          </span>
        )}
      </div>

      <div className="ad-product-flags">
        <label className="ad-switch ad-switch-sm">
          <input
            type="checkbox"
            checked={Boolean(product.published)}
            onChange={() => onToggle(product, 'published')}
          />
          <span>Live</span>
        </label>
        <label className="ad-switch ad-switch-sm">
          <input
            type="checkbox"
            checked={Boolean(product.featured)}
            onChange={() => onToggle(product, 'featured')}
          />
          <span>Home</span>
        </label>
      </div>

      <div className="ad-product-tools">
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={onEdit}>
          Edit
        </button>
        <a
          className="ad-icon-btn"
          href={`/shop/${product.slug}`}
          target="_blank"
          rel="noreferrer"
          aria-label="View on the site"
        >
          <ArrowUpRight width={15} height={15} />
        </a>
        <button
          type="button"
          className="ad-icon-btn ad-icon-danger"
          onClick={() => onDelete(product)}
          aria-label="Delete"
        >
          <TrashIcon width={15} height={15} />
        </button>
      </div>
    </article>
  );
}
