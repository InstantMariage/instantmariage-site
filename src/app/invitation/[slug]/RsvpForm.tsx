'use client';

import { useState } from 'react';

type Props = {
  slug: string;
  couleurPrimaire: string;
};

type FormState = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  presence: '' | 'oui' | 'non';
  nb_personnes: number;
  regime_alimentaire: string;
  message: string;
};

const INITIAL: FormState = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  presence: '',
  nb_personnes: 1,
  regime_alimentaire: '',
  message: '',
};

export default function RsvpForm({ slug, couleurPrimaire }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [accompagnantsPrenoms, setAccompagnantsPrenoms] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: keyof FormState, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleNbPersonnes(n: number) {
    update('nb_personnes', n);
    setAccompagnantsPrenoms(prev => {
      const slots = Math.max(0, n - 1);
      return Array.from({ length: slots }, (_, i) => prev[i] ?? '');
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.presence) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/invitations/${slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim() || null,
          presence: form.presence === 'oui',
          nb_personnes: form.presence === 'oui' ? form.nb_personnes : 0,
          accompagnants_prenoms: accompagnantsPrenoms.filter(p => p.trim() !== ''),
          regime_alimentaire: form.regime_alimentaire.trim() || null,
          message: form.message.trim() || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? 'Erreur lors de l\'envoi');
      }

      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12 px-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${couleurPrimaire}20` }}
        >
          <svg className="w-8 h-8" style={{ color: couleurPrimaire }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-serif text-gray-800 mb-2">Merci pour votre réponse&nbsp;!</h3>
        <p className="text-gray-500 text-sm">
          {form.presence === 'oui'
            ? 'Nous sommes ravis de vous compter parmi nos invités.'
            : 'Merci de nous avoir informés. Vous serez présents dans notre cœur.'}
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition';

  const labelClass = 'block text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Prénom / Nom */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Prénom *</label>
          <input
            type="text"
            required
            className={inputClass}
            placeholder="Sophie"
            value={form.prenom}
            onChange={e => update('prenom', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Nom *</label>
          <input
            type="text"
            required
            className={inputClass}
            placeholder="Dupont"
            value={form.nom}
            onChange={e => update('nom', e.target.value)}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email *</label>
        <input
          type="email"
          required
          className={inputClass}
          placeholder="sophie@email.fr"
          value={form.email}
          onChange={e => update('email', e.target.value)}
        />
      </div>

      {/* Téléphone */}
      <div>
        <label className={labelClass}>Téléphone <span className="text-gray-400 normal-case font-normal">(facultatif)</span></label>
        <input
          type="tel"
          className={inputClass}
          placeholder="+33 6 12 34 56 78"
          value={form.telephone}
          onChange={e => update('telephone', e.target.value)}
        />
      </div>

      {/* Présence */}
      <div>
        <label className={labelClass}>Serez-vous présent(e) ? *</label>
        <div className="grid grid-cols-2 gap-3">
          {(['oui', 'non'] as const).map(val => (
            <button
              key={val}
              type="button"
              onClick={() => update('presence', val)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition ${
                form.presence === val
                  ? 'border-rose-400 bg-rose-50 text-rose-700'
                  : 'border-rose-200 text-gray-500 hover:border-rose-300'
              }`}
            >
              {val === 'oui' ? '✓ Oui, avec joie !' : '✗ Je ne pourrai pas'}
            </button>
          ))}
        </div>
      </div>

      {/* Nombre de personnes (only when present) */}
      {form.presence === 'oui' && (
        <div>
          <label className={labelClass}>Nombre de personnes *</label>
          <select
            className={inputClass}
            value={form.nb_personnes}
            onChange={e => handleNbPersonnes(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'personne' : 'personnes'}</option>
            ))}
          </select>
        </div>
      )}

      {/* Prénoms accompagnants */}
      {form.presence === 'oui' && accompagnantsPrenoms.length > 0 && (
        <div className="space-y-3">
          <label className={labelClass}>
            Prénoms des accompagnants{' '}
            <span className="text-gray-400 normal-case font-normal">(facultatif)</span>
          </label>
          {accompagnantsPrenoms.map((val, i) => (
            <div key={i} className="transition-all duration-200">
              <input
                type="text"
                className={inputClass}
                placeholder={`Prénom de l'accompagnant ${i + 1}`}
                value={val}
                onChange={e => {
                  const next = [...accompagnantsPrenoms];
                  next[i] = e.target.value;
                  setAccompagnantsPrenoms(next);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Régime alimentaire */}
      <div>
        <label className={labelClass}>Régime alimentaire <span className="text-gray-400 normal-case font-normal">(facultatif)</span></label>
        <input
          type="text"
          className={inputClass}
          placeholder="Végétarien, sans gluten, allergie…"
          value={form.regime_alimentaire}
          onChange={e => update('regime_alimentaire', e.target.value)}
        />
      </div>

      {/* Message */}
      <div>
        <label className={labelClass}>Message <span className="text-gray-400 normal-case font-normal">(facultatif)</span></label>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Un mot pour les mariés…"
          value={form.message}
          onChange={e => update('message', e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm text-center">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!form.presence || status === 'loading'}
        className="w-full py-4 rounded-xl text-white font-semibold text-sm tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: couleurPrimaire }}
      >
        {status === 'loading' ? 'Envoi en cours…' : 'Envoyer ma réponse'}
      </button>
    </form>
  );
}
