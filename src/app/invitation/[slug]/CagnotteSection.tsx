'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface CagnotteSectionProps {
  invitationId: string;
  slug: string;
  titre: string;
  message: string;
  objectifCents: number | null;
  totalCents: number;
  coupleNames: string;
}

const QUICK_AMOUNTS = [20, 50, 100];

export default function CagnotteSection({
  invitationId,
  slug,
  titre,
  message,
  objectifCents,
  totalCents,
  coupleNames,
}: CagnotteSectionProps) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [montant, setMontant] = useState<number | ''>('');
  const [custom, setCustom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('cadeau') === 'merci') {
      setShowSuccess(true);
    }
  }, [searchParams]);

  const totalEuros = totalCents / 100;
  const objectifEuros = objectifCents ? objectifCents / 100 : null;
  const progression = objectifEuros ? Math.min(100, Math.round((totalEuros / objectifEuros) * 100)) : null;

  const montantEffectif = montant !== '' ? montant : (custom ? parseFloat(custom) || 0 : 0);

  async function handleSubmit() {
    setError('');
    if (!montantEffectif || montantEffectif < 5) {
      setError('Montant minimum : 5 €');
      return;
    }
    if (!nom.trim()) { setError('Votre prénom est requis'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cagnotte/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          montant: montantEffectif,
          nom: nom.trim(),
          email: email.trim(),
          message: msgText.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur, veuillez réessayer');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Erreur réseau, veuillez réessayer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #F06292 0%, #e91e8c 100%)', boxShadow: '0 8px 24px rgba(233,30,140,0.4)' }}
      >
        <span className="text-base">🎁</span>
        Offrir un cadeau
      </button>

      {/* Toast succès */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Merci pour votre cadeau ! Les mariés ont été informés 💕
          <button onClick={() => setShowSuccess(false)} className="ml-1 opacity-60 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Modale */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !loading) setOpen(false); }}
        >
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-3xl sm:rounded-t-3xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-1">Cagnotte mariage</p>
                  <h2 className="text-lg font-bold text-gray-900">{titre}</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Message */}
              {message && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{message}</p>
              )}

              {/* Barre de progression */}
              {objectifEuros && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span className="font-semibold text-gray-700">{totalEuros.toFixed(0)} € collectés</span>
                    <span>Objectif : {objectifEuros.toFixed(0)} €</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progression}%`, background: 'linear-gradient(90deg, #F06292, #e91e8c)' }}
                    />
                  </div>
                  <p className="text-xs text-rose-500 font-semibold mt-1 text-right">{progression}%</p>
                </div>
              )}
              {!objectifEuros && totalEuros > 0 && (
                <p className="text-sm font-semibold text-rose-500 mt-3">{totalEuros.toFixed(0)} € déjà collectés 💕</p>
              )}
            </div>

            {/* Corps */}
            <div className="px-6 py-5 space-y-5">

              {/* Montants rapides */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Choisissez un montant</label>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setMontant(amt); setCustom(''); }}
                      className="py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-150"
                      style={{
                        borderColor: montant === amt ? '#e91e8c' : '#f3f4f6',
                        background: montant === amt ? '#FFF0F5' : 'white',
                        color: montant === amt ? '#e91e8c' : '#374151',
                      }}
                    >
                      {amt} €
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={5}
                    step={1}
                    placeholder="Autre montant (ex: 75)"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value); setMontant(''); }}
                    className="w-full px-4 py-3 rounded-xl border-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
                    style={{ borderColor: custom ? '#e91e8c' : '#f3f4f6' }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">€</span>
                </div>
              </div>

              {/* Identité */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Vos coordonnées</label>
                <input
                  type="text"
                  placeholder="Votre prénom et nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-300 transition-all"
                />
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-300 transition-all"
                />
              </div>

              {/* Message optionnel */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message aux mariés <span className="font-normal normal-case text-gray-400">(optionnel)</span></label>
                <textarea
                  rows={2}
                  placeholder="Tous nos vœux de bonheur…"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-300 transition-all resize-none"
                />
              </div>

              {/* Erreur */}
              {error && (
                <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F06292 0%, #e91e8c 100%)' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Redirection vers le paiement…
                  </>
                ) : (
                  <>
                    <span>🎁</span>
                    {montantEffectif ? `Contribuer ${montantEffectif} €` : 'Contribuer'}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-400 leading-relaxed">
                Paiement sécurisé par Stripe. Vous recevrez un email de confirmation.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
