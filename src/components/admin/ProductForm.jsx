'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  CATEGORIES,
  SIZE_PRESETS,
  colorHex,
  colorName,
  colorValue,
  formatPKR,
  subCollections,
  NEW_ARRIVAL_LIMIT,
} from '@/lib/constants';
import { CloseIcon, PlusIcon, TrashIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  PRODUCT KA FORM
 *  ─────────────────────────────────────────────────────────────
 *  Naya product, ya purane ko badalna — dono ek hi form se.
 *
 *  Teen cheezein jaan boojh kar aasan rakhi gayi hain:
 *
 *  · Slug naam se khud banta hai. Aap chahein to haath se badal
 *    lein, magar sochna nahi parta.
 *  · Sizes category se khud aate hain — SIZE_PRESETS se, jo
 *    constants.js mein pehle se likhi thi magar poore project
 *    mein kahin istemal nahi ho rahi thi.
 *  · Colour ke naam aap khud likhte hain. Sirf wohi nazar aate
 *    hain jo aap ne is product ke liye likhe — aur koi nahi
 *    hai. Apna naam bhi likh sakte hain — magar phir wo grey
 *    dikhega, aur form ye saaf bata deta hai.
 *
 *  Tasveerein seedha yahan se Supabase Storage par jati hain.
 *  Pehli tasveer cover hai, doosri hover par nazar aati hai —
 *  is liye tarteeb badalne ke teer bhi diye gaye hain.
 * ═══════════════════════════════════════════════════════════════
 */

const BLANK = {
  name: '',
  slug: '',
  category: CATEGORIES[0]?.slug || 'womens-stitched',
  collection: '',
  price: '',
  compare_at_price: '',
  description: '',
  fabric: '',
  images: [],
  sizes: [],
  colors: [],
  in_stock: true,
  stock_count: '',
  featured: false,
  published: true,
};

const slugify = (value) =>
  String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* Naya rang chunte waqt ka pehla ishara — sirf ek shuruati
   qeemat, aap jo marzi chun lein. */
const DEFAULT_SWATCH = '#b79ea1';

export default function ProductForm({ product, onSave, onCancel }) {
  const editing = Boolean(product?.id);

  const [form, setForm] = useState(BLANK);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | saving | error
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [customHex, setCustomHex] = useState(DEFAULT_SWATCH);

  /* Bahar se tasveer utha kar andar chhorne ke liye */
  const [dropping, setDropping] = useState(false);
  /* Andar ki tasveerein aapas mein aage peeche karne ke liye */
  const [dragIndex, setDragIndex] = useState(null);

  const fileRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({
        ...BLANK,
        ...product,
        price: product.price ?? '',
        compare_at_price: product.compare_at_price ?? '',
        stock_count: product.stock_count ?? '',
        collection: product.collection || subCollections(product.category)[0]?.slug || '',
        images: Array.isArray(product.images) ? product.images : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
      });
      setSlugTouched(true);
    } else {
      setForm(BLANK);
      setSlugTouched(false);
    }
    setStatus('idle');
    setMessage('');
  }, [product]);

  const set = (key) => (e) => {
    const value =
      e?.target?.type === 'checkbox' ? e.target.checked : e?.target?.value ?? e;
    setForm((f) => ({ ...f, [key]: value }));
    if (status === 'error') setStatus('idle');
  };

  const onName = (e) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const toggleIn = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));

  /* ── Rang jorna aur hatana ──
     Naam aur rang dono ek hi likhai mein jate hain — "Peach|#ffd7b5" —
     magar grahak ko hamesha sirf "Peach" nazar aata hai. */

  const addColor = () => {
    const name = colorName(customColor);
    if (!name) return;

    const already = form.colors.some(
      (c) => colorName(c).toLowerCase() === name.toLowerCase()
    );
    if (already) {
      setCustomColor('');
      return;
    }

    setForm((f) => ({ ...f, colors: [...f.colors, colorValue(name, customHex)] }));
    setCustomColor('');
    setCustomHex(DEFAULT_SWATCH);
  };

  const removeColor = (value) =>
    setForm((f) => ({ ...f, colors: f.colors.filter((c) => c !== value) }));

  /* Jora hua rang baad mein badalna ho to — naam wohi, nishan naya. */
  const recolor = (value, hex) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c) => (c === value ? colorValue(colorName(c), hex) : c)),
    }));

  /* ── Tasveerein ── */

  const upload = async (files) => {
    // Folder se ya desktop se jo bhi aaye — sirf tasveerein lein.
    const list = [...files]
      .filter((f) => f && typeof f.type === 'string' && f.type.startsWith('image/'))
      .slice(0, 8);

    if (!list.length) {
      setMessage('Images only — JPG, PNG, WebP or AVIF.');
      return;
    }

    setUploading(true);
    setMessage('');

    for (const file of list) {
      const body = new FormData();
      body.append('file', file);
      body.append('name', form.name || 'product');

      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch('/api/admin/upload', { method: 'POST', body });
        // eslint-disable-next-line no-await-in-loop
        const data = await res.json().catch(() => ({}));

        if (data.ok) {
          setForm((f) => ({ ...f, images: [...f.images, data.url].slice(0, 12) }));
        } else {
          setMessage(data.message || 'That image could not be uploaded.');
        }
      } catch {
        setMessage('The connection dropped during upload.');
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const moveImage = (from, to) =>
    setForm((f) => {
      if (to < 0 || to >= f.images.length) return f;
      const images = [...f.images];
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      return { ...f, images };
    });

  const removeImage = (index) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  /* ── Bahar se tasveer utha kar yahan chhorna ──
     Sirf tab roshan hota hai jab waqai file aa rahi ho — text
     ghaseetne par nahi. Aur jab andar ki tarteeb badal rahi ho
     tab bhi nahi, warna dono ek doosre se takra jate hain. */
  const zoneDragOver = (e) => {
    if (dragIndex !== null) return;
    const types = e.dataTransfer ? [...e.dataTransfer.types] : [];
    if (!types.includes('Files')) return;
    e.preventDefault();
    if (!dropping) setDropping(true);
  };

  const zoneDragLeave = (e) => {
    // Andar ke kisi chhote hissay par jaane se band na ho
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDropping(false);
  };

  const zoneDrop = (e) => {
    if (dragIndex !== null) return;
    e.preventDefault();
    setDropping(false);
    const files = e.dataTransfer?.files;
    if (files && files.length) upload(files);
  };

  /* ── Screenshot seedha Ctrl + V se ──
     Har render par dobara lagta hai taake `upload` ke paas hamesha
     taza naam ho — ye listener halka hai, is ka koi bojh nahi. */
  useEffect(() => {
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.files || [])];
      if (!files.length) return;
      e.preventDefault();
      upload(files);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });

  /* ── Tasveerein aapas mein utha kar aage peeche ── */
  const thumbDrop = (to) => {
    if (dragIndex === null || dragIndex === to) {
      setDragIndex(null);
      return;
    }
    moveImage(dragIndex, to);
    setDragIndex(null);
  };

  /* ── Save ── */

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'saving') return;

    if (!form.name.trim()) {
      setStatus('error');
      setMessage('Please enter a product name.');
      return;
    }
    if (!(Number(form.price) > 0)) {
      setStatus('error');
      setMessage('Please enter a price.');
      return;
    }

    setStatus('saving');
    setMessage('');

    const payload = {
      ...form,
      slug: slugify(form.slug || form.name),
      price: Number(form.price),
      compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
      stock_count: form.stock_count === '' ? null : Number(form.stock_count),
    };

    const result = await onSave(payload, editing ? product.id : null);

    if (!result.ok) {
      setStatus('error');
      setMessage(result.message || 'That could not be saved.');
      return;
    }
    setStatus('idle');
  };

  const preset = SIZE_PRESETS[form.category] || [];

  const discount =
    Number(form.compare_at_price) > Number(form.price) && Number(form.price) > 0
      ? Math.round(
          ((Number(form.compare_at_price) - Number(form.price)) /
            Number(form.compare_at_price)) *
            100
        )
      : null;

  return (
    <form className="ad-form" onSubmit={submit} noValidate>
      <header className="ad-form-head">
        <h2>{editing ? 'Edit product' : 'New product'}</h2>
        <button type="button" className="ad-icon-btn" onClick={onCancel} aria-label="Close">
          <CloseIcon width={18} height={18} />
        </button>
      </header>

      <div className="ad-form-body">
        {/* ── Tasveerein ── */}
        <section className="ad-form-section">
          <p className="ad-block-title">Photos</p>

          <div
            className="ad-shots"
            data-dropping={dropping ? 'true' : 'false'}
            onDragOver={zoneDragOver}
            onDragLeave={zoneDragLeave}
            onDrop={zoneDrop}
          >
            {form.images.map((src, i) => (
              <div
                className="ad-shot"
                key={`${src}-${i}`}
                draggable
                data-dragging={dragIndex === i ? 'true' : 'false'}
                onDragStart={(e) => {
                  setDragIndex(i);
                  e.dataTransfer.effectAllowed = 'move';
                  // Firefox ko kuch na kuch chahiye hota hai
                  try { e.dataTransfer.setData('text/plain', String(i)); } catch { /* koi baat nahi */ }
                }}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => { if (dragIndex !== null) e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); thumbDrop(i); }}
              >
                <Image src={src} alt="" width={160} height={213} sizes="110px" unoptimized />
                {i === 0 && <span className="ad-shot-flag">Cover</span>}
                {i === 1 && <span className="ad-shot-flag ad-shot-flag-dim">Hover</span>}

                <div className="ad-shot-tools">
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove"
                    className="ad-shot-del"
                  >
                    <TrashIcon width={13} height={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    disabled={i === form.images.length - 1}
                    aria-label="Move later"
                  >
                    ›
                  </button>
                </div>
              </div>
            ))}

            <label className="ad-shot ad-shot-add">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                hidden
                onChange={(e) => upload(e.target.files)}
              />
              <PlusIcon width={20} height={20} />
              <span>{uploading ? 'Uploading…' : 'Photo'}</span>
            </label>

            <span className="ad-drop-veil" aria-hidden="true">
              <span>Drop them here</span>
            </span>
          </div>

          <p className="ad-hint">
            <strong>Drag photos straight in and drop them here</strong> — or press
            <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste. The first photo is the cover, the
            second shows on hover; to change the order, pick a photo up and put it
            where you want it. Portrait 3:4 (900 × 1200) works best. JPG, PNG,
            WebP or AVIF — up to 6 MB.
          </p>
        </section>

        {/* ── Buniyadi ── */}
        <section className="ad-form-section">
          <div className="ad-form-grid">
            <div className="ad-field ad-span-2">
              <label className="ad-label" htmlFor="p-name">Name *</label>
              <input id="p-name" className="ad-input" value={form.name} onChange={onName} />
            </div>

            <div className="ad-field ad-span-2">
              <label className="ad-label" htmlFor="p-slug">
                Slug <span className="ad-label-dim">— the web address</span>
              </label>
              <input
                id="p-slug"
                className="ad-input ad-mono"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug')(e);
                }}
              />
              <span className="ad-hint">/shop/{form.slug || '…'}</span>
            </div>

            <div className="ad-field">
              <label className="ad-label" htmlFor="p-category">Category *</label>
              <select
                id="p-category"
                className="ad-input"
                value={form.category}
                onChange={(e) => {
                  const category = e.target.value;
                  // Nayi category ke andar purana collection ka koi
                  // matlab nahi — us ka apna pehla option chun lein.
                  const subs = subCollections(category);
                  setForm((f) => ({
                    ...f,
                    category,
                    sizes: [],
                    collection: subs[0]?.slug || '',
                  }));
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>

              {/* Tees ki had sirf us waqt batai jati hai jab wohi
                  khana chuna gaya ho — warna form par ek aur jumla
                  bekar para rehta hai. */}
              {form.category === 'new-arrivals' && (
                <p className="ad-hint">
                  New Arrivals ke safhe par zyada se zyada{' '}
                  {NEW_ARRIVAL_LIMIT} suits nazar aate hain. Naya daalte hi sab
                  se purana neeche utar jata hai — wo mitta nahi, sirf is safhe
                  par aana band ho jata hai.
                </p>
              )}
            </div>

            {/* ── Collection ──
                Sirf un categories ke liye jin ke andar taqseem hai:
                Women's aur Men's mein Winter/Summer, Shawls mein
                Gents/Women's. Baqi ke liye ye khana nazar hi nahi
                aata, taake form saada rahe. */}
            {subCollections(form.category).length > 0 && (
              <div className="ad-field">
                <label className="ad-label" htmlFor="p-collection">
                  Collection *
                </label>
                <select
                  id="p-collection"
                  className="ad-input"
                  value={form.collection}
                  onChange={set('collection')}
                >
                  {subCollections(form.category).map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <p className="ad-hint">
                  This decides which shelf inside{' '}
                  {CATEGORIES.find((c) => c.slug === form.category)?.name} the
                  piece sits on.
                </p>
              </div>
            )}

            <div className="ad-field">
              <label className="ad-label" htmlFor="p-fabric">Fabric</label>
              <input
                id="p-fabric"
                className="ad-input"
                value={form.fabric}
                placeholder="Slub cotton lawn · printed net dupatta"
                onChange={set('fabric')}
              />
            </div>

            <div className="ad-field">
              <label className="ad-label" htmlFor="p-price">Price (PKR) *</label>
              <input
                id="p-price"
                className="ad-input ad-num"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={set('price')}
              />
            </div>

            <div className="ad-field">
              <label className="ad-label" htmlFor="p-compare">
                Was price <span className="ad-label-dim">— shown struck through</span>
              </label>
              <input
                id="p-compare"
                className="ad-input ad-num"
                type="number"
                min="0"
                step="1"
                value={form.compare_at_price ?? ''}
                onChange={set('compare_at_price')}
              />
              {discount && <span className="ad-hint ad-gold">−{discount}% shown</span>}
            </div>

            <div className="ad-field ad-span-2">
              <label className="ad-label" htmlFor="p-desc">Description</label>
              <textarea
                id="p-desc"
                className="ad-input ad-textarea"
                rows={4}
                value={form.description}
                placeholder="Cloth, work, dupatta, daaman — whatever the customer cannot feel with their hands, write it here."
                onChange={set('description')}
              />
            </div>
          </div>
        </section>

        {/* ── Sizes ── */}
        <section className="ad-form-section">
          <p className="ad-block-title">
            Sizes
            <span className="ad-label-dim"> — {CATEGORIES.find((c) => c.slug === form.category)?.name}</span>
          </p>
          <div className="ad-chips">
            {preset.map((size) => (
              <button
                key={size}
                type="button"
                className="ad-chip"
                aria-pressed={form.sizes.includes(size)}
                onClick={() => toggleIn('sizes', size)}
              >
                {size}
              </button>
            ))}
          </div>
          {form.sizes.length === 0 && (
            <p className="ad-hint">
              Pick no sizes and the size box does not appear on the product page
              at all — which is right for things like shawls.
            </p>
          )}
        </section>

        {/* ── Rang ──
            Pehle yahan pentees rang pehle se lage rehte thay — un
            mein se aksar kisi product par kabhi istemal hi nahi
            hote thay, aur chunte waqt asli rang unhi ke beech kho
            jata tha.

            Ab is khane mein sirf wohi rang hain jo aap ne is
            product ke liye khud likhe. Naam aap likhte hain, aur
            us ke sath ka nishan bhi aap hi chunte hain — is liye
            site par dikhne wala daira hamesha theek rehta hai aur
            constants.js kholne ki zaroorat kabhi nahi parti.

            Grahak ko order karte waqt inhi mein se ek chunna parta
            hai; ek se zyada rang hon to bina chune bag mein nahi
            ja sakta. */}
        <section className="ad-form-section">
          <p className="ad-block-title">
            Colour
            <span className="ad-label-dim">
              {' '}— sirf wohi jo aap likhein
            </span>
          </p>

          {/* Jo aap ne joray — har ek ke sath uska apna nishan */}
          {form.colors.length > 0 ? (
            <div className="ad-chips">
              {form.colors.map((value) => (
                <span key={value} className="ad-chip ad-chip-color is-on">
                  <label
                    className="ad-dot ad-dot-pick"
                    style={{ background: colorHex(value) }}
                    title={`${colorName(value)} — nishan ka rang badlein`}
                  >
                    <input
                      type="color"
                      value={colorHex(value)}
                      onChange={(e) => recolor(value, e.target.value)}
                      aria-label={`${colorName(value)} ka nishan`}
                    />
                  </label>

                  {colorName(value)}

                  <button
                    type="button"
                    className="ad-chip-x"
                    onClick={() => removeColor(value)}
                    aria-label={`${colorName(value)} hatayein`}
                    title="Hatayein"
                  >
                    <CloseIcon width={11} height={11} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="ad-hint">
              Abhi koi rang nahi. Neeche naam likh kar{' '}
              <strong>Add</strong> dabayein — jo aap likhenge, bas wohi
              grahak ko nazar aayega.
            </p>
          )}

          {/* Naya rang — naam, nishan, Add */}
          <div className="ad-row-fields ad-row-tight">
            <label
              className="ad-dot ad-dot-pick ad-dot-lg"
              style={{ background: customHex }}
              title="Is rang ka nishan chunein"
            >
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                aria-label="Naye rang ka nishan"
              />
            </label>

            <input
              className="ad-input"
              value={customColor}
              placeholder="Rang ka naam — jaise Peach"
              onChange={(e) => setCustomColor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                addColor();
              }}
            />

            <button type="button" className="ad-btn ad-btn-ghost" onClick={addColor}>
              Add
            </button>
          </div>

          <p className="ad-hint">
            Naam likhein, us ke baayein wala gol nishan dabakar asli rang
            chunein, phir <strong>Add</strong>. Ek se zyada rang hon to
            grahak ko order se pehle ek chunna hi parta hai.
          </p>
        </section>

        {/* ── Stock aur nazar ── */}
        <section className="ad-form-section">
          <div className="ad-form-grid">
            <div className="ad-field">
              <label className="ad-label" htmlFor="p-stock">
                Stock <span className="ad-label-dim">— leave empty for unlimited</span>
              </label>
              <input
                id="p-stock"
                className="ad-input ad-num"
                type="number"
                min="0"
                step="1"
                value={form.stock_count ?? ''}
                onChange={set('stock_count')}
              />
              <span className="ad-hint">
                This goes down by itself with every order. At zero the product
                turns “Sold out”.
              </span>
            </div>

            <div className="ad-field">
              <span className="ad-label">On the site</span>
              <div className="ad-switches">
                <label className="ad-switch">
                  <input type="checkbox" checked={form.published} onChange={set('published')} />
                  <span>Show on the site</span>
                </label>
                <label className="ad-switch">
                  <input type="checkbox" checked={form.featured} onChange={set('featured')} />
                  <span>Feature on the home page</span>
                </label>
                <label className="ad-switch">
                  <input type="checkbox" checked={form.in_stock} onChange={set('in_stock')} />
                  <span>In stock</span>
                </label>
              </div>

            </div>
          </div>
        </section>
      </div>

      <footer className="ad-form-foot">
        {message && (
          <p className={status === 'error' ? 'ad-error' : 'ad-hint'} role="alert">
            {message}
          </p>
        )}

        <span className="ad-spacer" />

        <span className="ad-form-price">
          {Number(form.price) > 0 ? formatPKR(Number(form.price)) : '—'}
        </span>

        <button type="button" className="ad-btn ad-btn-ghost" onClick={onCancel}>
          Discard
        </button>
        <button type="submit" className="ad-btn ad-btn-gold" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
        </button>
      </footer>
    </form>
  );
}
