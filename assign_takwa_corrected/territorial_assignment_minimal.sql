-- =====================================================
-- SYSTÈME D'AFFECTATION TERRITORIALE - VERSION MINIMALE
-- =====================================================

-- 1. Créer la table d'affectation territoriale
DROP TABLE IF EXISTS utilisateur_affectation_territoriale;

CREATE TABLE utilisateur_affectation_territoriale (
    code INT PRIMARY KEY AUTO_INCREMENT,
    code_utilisateur INT NOT NULL,
    type_territorial ENUM('region', 'departement', 'arrondissement') NOT NULL,
    code_territorial INT NOT NULL,
    affecte_par INT NULL,
    date_affectation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    
    -- Index pour les performances
    INDEX idx_utilisateur_territoires (code_utilisateur, est_actif),
    INDEX idx_recherche_territoriale (type_territorial, code_territorial),
    INDEX idx_affecte_par (affecte_par),
    INDEX idx_date_affectation (date_affectation),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE KEY affectation_unique (code_utilisateur, type_territorial, code_territorial, est_actif)
);

SELECT 'Table utilisateur_affectation_territoriale créée avec succès!' as status;

-- 2. Ajouter les nouveaux rôles territoriaux (sans description)
INSERT IGNORE INTO role (libelle) VALUES 
('observateur_regional'),
('observateur_departemental'),
('observateur_arrondissement'),
('validateur_regional'),
('validateur_departemental'),
('validateur_arrondissement');

SELECT 'Rôles territoriaux ajoutés avec succès!' as status;

-- 3. Afficher les rôles ajoutés
SELECT 
    code, 
    libelle
FROM role 
WHERE libelle LIKE '%observateur_%' OR libelle LIKE '%validateur_%'
ORDER BY libelle;

-- 4. Créer la procédure d'affectation territoriale
DELIMITER //

DROP PROCEDURE IF EXISTS AffecterTerritoireUtilisateur//
CREATE PROCEDURE AffecterTerritoireUtilisateur(
    IN p_code_utilisateur INT,
    IN p_type_territorial VARCHAR(20),
    IN p_code_territorial INT,
    IN p_affecte_par INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Désactiver l'affectation existante si elle existe
    UPDATE utilisateur_affectation_territoriale 
    SET est_actif = 0, date_modification = NOW()
    WHERE code_utilisateur = p_code_utilisateur 
      AND type_territorial = p_type_territorial 
      AND code_territorial = p_code_territorial 
      AND est_actif = 1;
    
    -- Insérer nouvelle affectation
    INSERT INTO utilisateur_affectation_territoriale 
    (code_utilisateur, type_territorial, code_territorial, affecte_par, notes)
    VALUES (p_code_utilisateur, p_type_territorial, p_code_territorial, p_affecte_par, p_notes);
    
    COMMIT;
    
    SELECT 'Territoire affecté avec succès!' as resultat;
END //

-- 5. Créer la procédure de suppression
DROP PROCEDURE IF EXISTS SupprimerTerritoireUtilisateur//
CREATE PROCEDURE SupprimerTerritoireUtilisateur(
    IN p_code_utilisateur INT,
    IN p_type_territorial VARCHAR(20), 
    IN p_code_territorial INT
)
BEGIN
    UPDATE utilisateur_affectation_territoriale 
    SET est_actif = 0, date_modification = NOW()
    WHERE code_utilisateur = p_code_utilisateur 
      AND type_territorial = p_type_territorial 
      AND code_territorial = p_code_territorial 
      AND est_actif = 1;
    
    SELECT 'Territoire supprimé avec succès!' as resultat;
END //

DELIMITER ;

-- 6. Tests et vérification
SELECT 'Vérification de la structure de la nouvelle table:' as info;
DESCRIBE utilisateur_affectation_territoriale;

-- Afficher les utilisateurs disponibles pour tests
SELECT 'Utilisateurs disponibles:' as info;
SELECT code, username, noms_prenoms FROM utilisateur LIMIT 5;

-- Exemples d'utilisation (décommentez pour tester)
/*
-- Tester l'affectation d'un territoire
CALL AffecterTerritoireUtilisateur(1, 'region', 2, 1, 'Test affectation région');

-- Vérifier les affectations
SELECT * FROM utilisateur_affectation_territoriale WHERE est_actif = 1;

-- Supprimer l'affectation de test
CALL SupprimerTerritoireUtilisateur(1, 'region', 2);
*/

SELECT 'Configuration terminée! Vous pouvez maintenant affecter des territoires aux utilisateurs.' as message_final;