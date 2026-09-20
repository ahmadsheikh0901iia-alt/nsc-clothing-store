'use client';

import { useState } from 'react';
import { saveMessage } from '@/lib/data/orders';
import { STORE, whatsappLink } from '@/lib/constants';
import { CheckIcon, WhatsAppIcon } from '@/components/ui/Icons';

/**
 * Contact form.
 *
 * Pehle ye sirf WhatsApp khol deta tha. Agar customer "send" na
 * dabata — ya galti se tab band kar deta — to paigham kahin nahi
 * bachta tha aur aap ko kabhi pata bhi nahi chalta.
 *
 * Ab tarteeb ulti hai: paigham PEHLE mehfooz hota hai (aur aap ko
 * Telegram par ittila chali jati hai), phir WhatsApp khulta hai
 * taake baat jari rah sake.
 *
 * Agar database tak baat na pohanche to bhi WhatsApp khul jata
 * hai — customer ka waqt kisi soorat zaya nahi hota.
 */

const HONEYPOT = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  opacity: 0,
  pointerEvents: 'none',
};

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    subject: 'General enquiry',
    message: '',
  });
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!form.message.trim()) next.message = 'What would you like to ask?';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');

    // Pehle mehfooz — chahe WhatsApp khule ya na khule.
    await saveMessage({ ...form, website });

    const text = `Assalam o alaikum!\n\nName: ${form.name}${
      form.phone ? `\nPhone: ${form.phone}` : ''
    }\nSubject: ${form.subject}\n\n${form.message}`;

    window.open(whatsappLink(text), '_blank', 'noopener');
    setStatus('done');
  };

  if (status === 'done') {
    return (
      <div className="col" style={{ gap: '1rem', alignItems: 'flex-start' }}>
        <span
          className="row"
          style={{
            width: 48,
            height: 48,
            borderRadius: '999px',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            justifyContent: 'center',
          }}
          aria-hidden="true"
        >
          <CheckIcon width={20} height={20} />
        </span>

        <h3 className="display" style={{ fontSize: '1.5rem', margin: 0 }}>
          Message received
        </h3>

        <p className="muted" style={{ fontSize: '0.95rem', maxWidth: '44ch' }}>
          Your message has reached us, and WhatsApp has opened too — send it there
          and we can carry the conversation on in one place. We usually reply
          within the hour.
        </p>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setForm({ name: '', phone: '', subject: 'General enquiry', message: '' });
            setWebsite('');
            setStatus('idle');
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="col" style={{ gap: '1.15rem' }} noValidate>
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="c-name">
            Your name *
          </label>
          <input
            id="c-name"
            className="input"
            value={form.name}
            onChange={set('name')}
            aria-invalid={errors.name ? 'true' : undefined}
            autoComplete="name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="c-phone">
            Phone (optional)
          </label>
          <input
            id="c-phone"
            className="input"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
          />
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="c-subject">
            Subject
          </label>
          <select id="c-subject" className="select" value={form.subject} onChange={set('subject')}>
            <option>General enquiry</option>
            <option>Order status</option>
            <option>Exchange or return</option>
            <option>Bulk / wholesale order</option>
            <option>Custom stitching</option>
          </select>
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="c-message">
            Message *
          </label>
          <textarea
            id="c-message"
            className="textarea"
            value={form.message}
            onChange={set('message')}
            aria-invalid={errors.message ? 'true' : undefined}
            placeholder="Tell us what you are looking for…"
          />
          {errors.message && <span className="field-error">{errors.message}</span>}
        </div>

        <div aria-hidden="true" style={HONEYPOT}>
          <label htmlFor="c-website">Website</label>
          <input
            id="c-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'sending'}>
        <WhatsAppIcon width={17} height={17} />
        {status === 'sending' ? 'Sending…' : 'Send on WhatsApp'}
      </button>

      <p className="faint" style={{ fontSize: '0.8125rem' }}>
        Your message is saved with us first, then WhatsApp opens so you can
        speak to us directly — {STORE.phone}. We are here around the clock and
        usually reply within the hour.
      </p>
    </form>
  );
}
