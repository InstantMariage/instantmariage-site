-- Sync invitation_templates slugs with the UI templateId values
-- The original 019 migration used different slugs than the page routes

INSERT INTO public.invitation_templates (slug, nom, description, categorie, plan_requis, config_defaut, ordre)
VALUES
  ('elegance-doree', 'Élégance Dorée', 'Classique & Raffiné — enveloppe animée avec sceau de cire', 'classique', 'gratuit',
   '{"couleur_primaire": "#C9A84C", "animation": "enveloppe_cire"}', 10),
  ('boheme-champetre', 'Bohème Champêtre', 'Nature & Bohème', 'champetre', 'gratuit',
   '{"couleur_primaire": "#6B8F71"}', 11),
  ('moderne-minimal', 'Moderne Minimal', 'Épuré & Contemporain', 'moderne', 'gratuit',
   '{"couleur_primaire": "#1a1a1a"}', 12),
  ('luxe-marbre', 'Luxe Marbré', 'Luxe & Sophistiqué', 'luxe', 'premium',
   '{"couleur_primaire": "#8B7355"}', 13),
  ('romantique-floral', 'Romantique Floral', 'Romantique & Fleuri', 'classique', 'gratuit',
   '{"couleur_primaire": "#F06292"}', 14),
  ('cote-dazur', 'Côte d''Azur', 'Méditerranéen & Lumineux', 'moderne', 'gratuit',
   '{"couleur_primaire": "#0284C7"}', 15),
  ('provence-olivier', 'Provence Olivier', 'Provençal & Authentique', 'champetre', 'gratuit',
   '{"couleur_primaire": "#6B7C45"}', 16),
  ('nuit-etoilee', 'Nuit Étoilée', 'Mystique & Romantique', 'classique', 'premium',
   '{"couleur_primaire": "#C9A96E"}', 17)
ON CONFLICT (slug) DO NOTHING;
