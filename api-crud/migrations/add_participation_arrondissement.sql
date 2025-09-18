-- Migration pour ajouter la table ParticipationArrondissement
-- Date: 2024-01-XX

-- Créer la table ParticipationArrondissement
CREATE TABLE IF NOT EXISTS "ParticipationArrondissement" (
    "code" SERIAL PRIMARY KEY,
    "code_arrondissement" INTEGER NOT NULL UNIQUE,
    "nombre_bureau_vote" INTEGER NOT NULL DEFAULT 0,
    "nombre_inscrit" INTEGER NOT NULL DEFAULT 0,
    "nombre_enveloppe_urnes" INTEGER NOT NULL DEFAULT 0,
    "nombre_enveloppe_bulletins_differents" INTEGER NOT NULL DEFAULT 0,
    "nombre_bulletin_electeur_identifiable" INTEGER NOT NULL DEFAULT 0,
    "nombre_bulletin_enveloppes_signes" INTEGER NOT NULL DEFAULT 0,
    "nombre_enveloppe_non_elecam" INTEGER NOT NULL DEFAULT 0,
    "nombre_bulletin_non_elecam" INTEGER NOT NULL DEFAULT 0,
    "nombre_bulletin_sans_enveloppe" INTEGER NOT NULL DEFAULT 0,
    "nombre_enveloppe_vide" INTEGER NOT NULL DEFAULT 0,
    "nombre_suffrages_valable" INTEGER NOT NULL DEFAULT 0,
    "nombre_votant" INTEGER NOT NULL DEFAULT 0,
    "bulletin_nul" INTEGER NOT NULL DEFAULT 0,
    "suffrage_exprime" DOUBLE PRECISION,
    "taux_participation" DOUBLE PRECISION,
    "date_creation" TEXT,
    CONSTRAINT "ParticipationArrondissement_code_arrondissement_fkey" 
        FOREIGN KEY ("code_arrondissement") REFERENCES "Arrondissement"("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Créer un index sur code_arrondissement pour améliorer les performances
CREATE INDEX IF NOT EXISTS "idx_participation_arrondissement_code_arrondissement" 
    ON "ParticipationArrondissement"("code_arrondissement");

-- Ajouter un commentaire sur la table
COMMENT ON TABLE "ParticipationArrondissement" IS 'Table pour stocker les données de participation électorale par arrondissement';
