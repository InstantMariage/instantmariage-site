export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-rose-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#F06292] text-sm font-semibold tracking-widest uppercase mb-3">
            Ils nous rejoignent bientôt
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Soyez le premier à laisser votre avis
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-300 to-gold-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            La plateforme est toute neuve — les premiers mariés et prestataires arrivent. Rejoignez l&apos;aventure dès maintenant&nbsp;!
          </p>
        </div>

        {/* Coming soon cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "📸",
              label: "Futurs mariés",
              text: "Vous organisez votre mariage ? Inscrivez-vous et dites-nous comment InstantMariage vous a aidé.",
            },
            {
              icon: "💐",
              label: "Prestataires",
              text: "Vous êtes photographe, traiteur, DJ ? Rejoignez la plateforme et recevez vos premiers avis vérifiés.",
            },
            {
              icon: "⭐",
              label: "Votre avis compte",
              text: "Les premiers témoignages construisent la confiance. Soyez pionnier et inspirez les futurs mariés.",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-8 shadow-card border border-rose-50 flex flex-col items-center text-center"
            >
              <span className="text-4xl mb-4">{card.icon}</span>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{card.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-14 bg-white rounded-2xl shadow-card p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {[
              { value: "500+", label: "Mariages organisés", icon: "💍" },
              { value: "100+", label: "Prestataires vérifiés", icon: "✅" },
              { value: "100%", label: "Avis authentiques", icon: "🛡️" },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center">
                <span className="text-2xl mb-2">{badge.icon}</span>
                <p
                  className="text-2xl md:text-3xl font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {badge.value}
                </p>
                <p className="text-gray-500 text-sm mt-1">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
