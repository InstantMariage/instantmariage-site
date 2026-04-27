"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Props = {
  slug: string;
  prenom1: string;
  prenom2: string | null;
  dateMariage: string | null;
};

type FileItem = {
  file: File;
  preview: string | null;
  isVideo: boolean;
};

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "video/mp4", "video/quicktime", "video/webm",
];
const MAX_SIZE = 52_428_800; // 50 Mo

function formatDateFr(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function AlbumUploadClient({ slug, prenom1, prenom2, dateMariage }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [prenom, setPrenom] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = prenom2 ? `${prenom1} & ${prenom2}` : prenom1;

  const addFiles = useCallback((incoming: File[]) => {
    const items: FileItem[] = incoming.map((f) => ({
      file: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      isVideo: f.type.startsWith("video/"),
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      if (prev[idx].preview) URL.revokeObjectURL(prev[idx].preview!);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    setErrors([]);

    const errs: string[] = [];
    let uploaded = 0;

    for (let i = 0; i < files.length; i++) {
      const { file, isVideo } = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.push(`${file.name} : type non autorisé (${file.type})`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errs.push(`${file.name} : fichier trop volumineux (max 50 Mo)`);
        continue;
      }

      const ext = file.name.split(".").pop() ?? "bin";
      const uid = crypto.randomUUID();
      const storagePath = `${slug}/${uid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("album-mariage")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        errs.push(`${file.name} : erreur upload`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("album-mariage")
        .getPublicUrl(storagePath);

      const res = await fetch(`/api/album/${slug}/save-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: publicUrl,
          type: isVideo ? "video" : "photo",
          nom_fichier: file.name,
          taille_fichier: file.size,
          uploade_par: prenom.trim() || null,
        }),
      });

      if (!res.ok) {
        errs.push(`${file.name} : erreur enregistrement`);
        continue;
      }

      uploaded++;
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setErrors(errs);

    if (uploaded > 0) {
      setProgress(100);
      setDone(true);
      files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
      setFiles([]);
    } else if (!errs.length) {
      setErrors(["Aucun fichier n'a pu être envoyé."]);
    }

    setUploading(false);
  };

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FEF0F5" }}>
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)" }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Vos photos ont été partagées avec {title}. Ils seront ravis de les retrouver dans leur album 🎉
          </p>
          <button
            onClick={() => { setDone(false); setProgress(0); }}
            className="text-sm font-semibold px-6 py-2.5 rounded-full transition-all hover:opacity-80"
            style={{ background: "#F06292", color: "white" }}
          >
            Partager d&apos;autres photos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20" style={{ background: "#FEF0F5" }}>
      {/* Header */}
      <div
        className="px-6 pt-10 pb-8 text-center"
        style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
      >
        <div className="flex justify-center mb-3">
          <Image src="/logo.png" alt="InstantMariage" width={120} height={32} className="brightness-0 invert opacity-90" />
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">
          Mariage de {title}
        </h1>
        {dateMariage && (
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            {formatDateFr(dateMariage)}
          </p>
        )}
        <p className="text-sm mt-3 font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
          Partagez vos photos & vidéos avec les mariés 📷
        </p>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-6 space-y-4">

        {/* Prénom optionnel */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "white", border: "1px solid #FECDD3" }}
        >
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Votre prénom (optionnel)
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="ex : Sophie"
            className="w-full text-sm text-gray-800 placeholder-gray-300 outline-none"
            style={{ background: "transparent" }}
          />
        </div>

        {/* Zone de drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all"
          style={{
            borderColor: dragOver ? "#F06292" : "#FECDD3",
            background: dragOver ? "#FFF0F5" : "white",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "#FFF0F5", color: "#F06292" }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">Glissez vos photos ici</p>
          <p className="text-xs text-gray-400 mt-1">ou cliquez pour choisir</p>
          <p className="text-xs text-gray-300 mt-2">JPG, PNG, HEIC, MP4, MOV · 50 Mo max</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={onInputChange}
        />

        {/* Bouton alternatif */}
        {!files.length && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "#F06292", color: "white" }}
          >
            Choisir des photos
          </button>
        )}

        {/* Prévisualisation */}
        {files.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", border: "1px solid #FECDD3" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs font-semibold"
                style={{ color: "#F06292" }}
              >
                + Ajouter
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group" style={{ background: "#FFF0F5" }}>
                  {f.preview ? (
                    <Image src={f.preview} alt={f.file.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6" style={{ color: "#F06292" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div className="rounded-2xl px-5 py-4" style={{ background: "white", border: "1px solid #FECDD3" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Envoi en cours…</p>
              <p className="text-xs font-semibold" style={{ color: "#F06292" }}>{progress}%</p>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "#FEE2E2" }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F06292, #e91e8c)" }}
              />
            </div>
          </div>
        )}

        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="rounded-2xl px-5 py-4" style={{ background: "#FFF0F5", border: "1px solid #FECDD3" }}>
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-500 font-medium">{e}</p>
            ))}
          </div>
        )}

        {/* Bouton envoyer */}
        {files.length > 0 && !uploading && (
          <button
            onClick={upload}
            className="w-full py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-80 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
              color: "white",
              boxShadow: "0 8px 24px rgba(240,98,146,0.3)",
            }}
          >
            Partager {files.length} photo{files.length > 1 ? "s" : ""}
          </button>
        )}
      </div>
    </main>
  );
}
