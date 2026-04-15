-- ─── Migration 017 : Vue prestataires_ranked avec score de classement ──────────
--
-- Score total sur 100 points :
--   Plan d'abonnement (40 pts max) : Premium=40, Pro=30, Starter/Essentiel=15, Gratuit=0
--   Complétude du profil (60 pts max) :
--     Photo de couverture           : 15 pts
--     Au moins 3 photos galerie     : 10 pts
--     Description ≥ 100 caractères  : 10 pts
--     Ville renseignée              :  5 pts
--     Téléphone renseigné           :  5 pts
--     Site web ou Instagram         :  5 pts
--     Tarif renseigné               :  5 pts
--     Au moins 1 vidéo              :  5 pts
--
-- Tri garanti :
--   1. plan_score DESC  (Premium > Pro > Starter > Gratuit)
--   2. has_cover DESC   (sans photo de couverture → toujours en dernier dans son groupe de plan)
--   3. completeness_score DESC
--   4. created_at ASC   (ancienneté comme départage final)

CREATE OR REPLACE VIEW prestataires_ranked AS
SELECT
  r.*,

  -- Score du plan (0 / 15 / 30 / 40)
  CASE r.active_plan
    WHEN 'premium'   THEN 40
    WHEN 'pro'       THEN 30
    WHEN 'starter'   THEN 15
    WHEN 'essentiel' THEN 15
    ELSE 0
  END AS plan_score,

  -- Photo de couverture présente (booléen)
  (r.cover_url IS NOT NULL AND r.cover_url <> '') AS has_cover,

  -- Score de complétude du profil (0-60)
  (
      CASE WHEN r.cover_url IS NOT NULL AND r.cover_url <> '' THEN 15 ELSE 0 END
    + CASE WHEN array_length(r.photos, 1) >= 3               THEN 10 ELSE 0 END
    + CASE WHEN r.description IS NOT NULL
               AND char_length(r.description) >= 100         THEN 10 ELSE 0 END
    + CASE WHEN r.ville      IS NOT NULL AND r.ville      <> '' THEN 5 ELSE 0 END
    + CASE WHEN r.telephone  IS NOT NULL AND r.telephone  <> '' THEN 5 ELSE 0 END
    + CASE WHEN (r.site_web  IS NOT NULL AND r.site_web   <> '')
            OR  (r.instagram IS NOT NULL AND r.instagram  <> '') THEN 5 ELSE 0 END
    + CASE WHEN r.prix_depart IS NOT NULL                    THEN  5 ELSE 0 END
    + CASE WHEN EXISTS (
        SELECT 1 FROM prestataire_videos pv
        WHERE pv.prestataire_id = r.id
      )                                                       THEN  5 ELSE 0 END
  ) AS completeness_score,

  -- Score total (plan + completude, 0-100)
  (
    CASE r.active_plan
      WHEN 'premium'   THEN 40
      WHEN 'pro'       THEN 30
      WHEN 'starter'   THEN 15
      WHEN 'essentiel' THEN 15
      ELSE 0
    END
    + CASE WHEN r.cover_url IS NOT NULL AND r.cover_url <> '' THEN 15 ELSE 0 END
    + CASE WHEN array_length(r.photos, 1) >= 3               THEN 10 ELSE 0 END
    + CASE WHEN r.description IS NOT NULL
               AND char_length(r.description) >= 100         THEN 10 ELSE 0 END
    + CASE WHEN r.ville      IS NOT NULL AND r.ville      <> '' THEN 5 ELSE 0 END
    + CASE WHEN r.telephone  IS NOT NULL AND r.telephone  <> '' THEN 5 ELSE 0 END
    + CASE WHEN (r.site_web  IS NOT NULL AND r.site_web   <> '')
            OR  (r.instagram IS NOT NULL AND r.instagram  <> '') THEN 5 ELSE 0 END
    + CASE WHEN r.prix_depart IS NOT NULL                    THEN  5 ELSE 0 END
    + CASE WHEN EXISTS (
        SELECT 1 FROM prestataire_videos pv
        WHERE pv.prestataire_id = r.id
      )                                                       THEN  5 ELSE 0 END
  ) AS score

FROM (
  -- Sous-requete pour calculer active_plan une seule fois
  SELECT
    p.*,
    COALESCE(
      (
        SELECT a.plan FROM abonnements a
        WHERE  a.prestataire_id = p.id
          AND  a.statut = 'actif'
        ORDER BY a.created_at DESC
        LIMIT 1
      ),
      'gratuit'
    ) AS active_plan
  FROM prestataires p
) r;

-- Droits de lecture (memes politiques que la table prestataires)
GRANT SELECT ON prestataires_ranked TO anon;
GRANT SELECT ON prestataires_ranked TO authenticated;
