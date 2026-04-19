"use client";

import { useState, useEffect } from "react";

const COMPOSITIONS = [
  "EleganceDoree",
  "BohemeChampetre",
  "ModerneMinimal",
  "LuxeMarbre",
  "RomantiqueFloral",
  "CoteAzur",
  "ProvenceOlivier",
  "NuitEtoilee",
];

interface EnvVar {
  key: string;
  set: boolean;
  value: string | null;
}

interface EnvStatus {
  ok: boolean;
  vars: EnvVar[];
}

interface RenderResult {
  ok?: boolean;
  error?: string;
  details?: unknown;
  missing?: string[];
  renderId?: string;
  bucketName?: string;
  done?: boolean;
  progress?: number;
  videoUrl?: string | null;
  composition?: string;
}

export default function FairepartTestPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [selectedComposition, setSelectedComposition] = useState("EleganceDoree");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RenderResult | null>(null);

  useEffect(() => {
    fetch("/api/faire-part/test-render")
      .then((r) => r.json())
      .then(setEnvStatus)
      .catch(() => setEnvStatus({ ok: false, vars: [] }));
  }, []);

  async function handleRender() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/faire-part/test-render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ composition: selectedComposition }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Erreur réseau", details: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Remotion Lambda</h1>
          <p className="text-gray-500 text-sm mt-1">Page de diagnostic — non accessible en production</p>
        </div>

        {/* Env vars status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Variables d&apos;environnement
          </h2>
          {envStatus === null ? (
            <p className="text-gray-400 text-sm">Vérification…</p>
          ) : (
            <>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${envStatus.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <span className={`w-2 h-2 rounded-full ${envStatus.ok ? "bg-green-500" : "bg-red-500"}`} />
                {envStatus.ok ? "Toutes les variables sont configurées" : "Variables manquantes"}
              </div>
              <div className="space-y-2 mt-3">
                {envStatus.vars.map((v) => (
                  <div key={v.key} className="flex items-center justify-between text-sm">
                    <code className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {v.key}
                    </code>
                    <div className="flex items-center gap-2">
                      {v.value && (
                        <span className="text-gray-400 font-mono text-xs">{v.value}</span>
                      )}
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${v.set ? "bg-green-400" : "bg-red-400"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Render test */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Tester un rendu Lambda
          </h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Template</label>
            <select
              value={selectedComposition}
              onChange={(e) => setSelectedComposition(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              {COMPOSITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRender}
            disabled={loading || !envStatus?.ok}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            {loading ? "Rendu en cours… (peut prendre 30–90s)" : "Tester le rendu"}
          </button>

          {!envStatus?.ok && envStatus !== null && (
            <p className="text-xs text-red-500">
              Configurez les variables manquantes dans .env.local avant de tester.
            </p>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`bg-white rounded-xl border p-6 space-y-3 ${result.ok ? "border-green-200" : "border-red-200"}`}>
            <h2 className={`font-semibold text-sm uppercase tracking-wide ${result.ok ? "text-green-700" : "text-red-700"}`}>
              {result.ok ? "Rendu réussi" : "Erreur"}
            </h2>

            {result.ok && result.videoUrl && (
              <div className="space-y-2">
                <video
                  src={result.videoUrl}
                  controls
                  className="w-full rounded-lg max-h-64 bg-black"
                />
                <a
                  href={result.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-rose-600 hover:underline break-all"
                >
                  {result.videoUrl}
                </a>
              </div>
            )}

            {result.ok && !result.videoUrl && (
              <p className="text-sm text-gray-500">
                Rendu lancé (renderId : <code className="font-mono text-xs">{result.renderId}</code>), vidéo non encore disponible.
              </p>
            )}

            {result.error && (
              <div className="space-y-2">
                <p className="text-sm text-red-600">{result.error}</p>
                {result.missing && (
                  <ul className="text-xs text-red-500 list-disc list-inside">
                    {result.missing.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                )}
                {result.details && (
                  <pre className="text-xs bg-red-50 p-3 rounded overflow-auto max-h-40 text-red-800">
                    {typeof result.details === "string" ? result.details : JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-gray-400">Réponse complète</summary>
              <pre className="mt-2 bg-gray-50 p-3 rounded overflow-auto max-h-48 text-gray-700">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
