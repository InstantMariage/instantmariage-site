import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MessagesIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 select-none">
      <div
        className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-sm"
        style={{ background: "#FFF0F5" }}
      >
        <svg
          className="w-10 h-10"
          style={{ color: "#F06292" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      <p
        className="font-semibold text-gray-700 text-lg mb-2"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Vos messages
      </p>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        Sélectionnez une conversation dans la liste pour commencer à échanger.
      </p>
    </div>
  );
}
