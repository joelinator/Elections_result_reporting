-- =====================================================
-- SYSTÈME D'AFFECTATION TERRITORIALE - VERSION CORRIGÉE
-- =====================================================

-- Étape 1: Vérifier la structure des tables existantes
SELECT 'Vérification des tables existantes...' as status;

-- Vérifier si la table utilisateur existe et sa structure
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    COLUMN_KEY,
    DATA_TYPE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'utilisateur'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- 1. CRÉATION DE LA TABLE SANS CONTRAINTES ÉTRANGÈRES POUR COMMENCER
-- =====================================================

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
    
    -- Index pour les performances (sans contraintes étrangères pour l'instant)
    INDEX idx_utilisateur_territoires (code_utilisateur, est_actif),
    INDEX idx_recherche_territoriale (type_territorial, code_territorial),
    INDEX idx_affecte_par (affecte_par),
    INDEX idx_date_affectation (date_affectation),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE KEY affectation_unique (code_utilisateur, type_territorial, code_territorial, est_actif)
);

-- Vérifier que la table a été créée
SELECT 'Table utilisateur_affectation_territoriale créée avec succès!' as status;

-- =====================================================
-- 2. AJOUT DES NOUVEAUX RÔLES TERRITORIAUX
-- =====================================================

-- Vérifier si les rôles existent déjà avant de les insérer
INSERT IGNORE INTO role (libelle, description) VALUES 
('observateur_regional', 'Observateur au niveau régional - peut voir les données de ses régions assignées'),
('observateur_departemental', 'Observateur au niveau départemental - peut voir les données de ses départements assignés'),
('observateur_arrondissement', 'Observateur au niveau arrondissement - peut voir les données de ses arrondissements assignés'),
('validateur_regional', 'Validateur au niveau régional - peut valider dans ses régions assignées'),
('validateur_departemental', 'Validateur au niveau départemental - peut valider dans ses départements assignés'),
('validateur_arrondissement', 'Validateur au niveau arrondissement - peut valider dans ses arrondissements assignés');

-- Afficher les rôles ajoutés
SELECT 
    code, 
    libelle, 
    description 
FROM role 
WHERE libelle LIKE '%observateur_%' OR libelle LIKE '%validateur_%'
ORDER BY libelle;

-- =====================================================
-- 3. PROCÉDURES STOCKÉES SIMPLIFIÉES
-- =====================================================

DELIMITER //

-- Procédure pour affecter un territoire à un utilisateur
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
END //

-- Procédure pour supprimer l'affectation territoriale
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
END //

-- Fonction pour vérifier si l'utilisateur a accès au territoire
DROP FUNCTION IF EXISTS UtilisateurAccesTerritoire//
CREATE FUNCTION UtilisateurAccesTerritoire(
    p_code_utilisateur INT,
    p_type_territorial VARCHAR(20),
    p_code_territorial INT
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE a_acces INT DEFAULT 0;
    
    -- Affectation directe
    SELECT COUNT(*) INTO a_acces
    FROM utilisateur_affectation_territoriale 
    WHERE code_utilisateur = p_code_utilisateur 
      AND type_territorial = p_type_territorial 
      AND code_territorial = p_code_territorial 
      AND est_actif = 1;
    
    RETURN a_acces > 0;
END //

DELIMITER ;

-- =====================================================
-- 4. EXEMPLES D'UTILISATION ET TESTS
-- =====================================================

-- Afficher les utilisateurs existants pour référence
SELECT 'Utilisateurs disponibles pour les tests:' as info;
SELECT code, username, noms_prenoms FROM utilisateur LIMIT 5;

-- Exemples de comment affecter des territoires (à adapter avec vos vrais codes)
SELECT 'Exemples d\'affectation (décommentez pour utiliser):' as info;
/*
-- Exemple 1: Affecter la région Centre (code 2) à l'utilisateur 1
CALL AffecterTerritoireUtilisateur(1, 'region', 2, 1, 'Affectation test région Centre');

-- Exemple 2: Affecter le département Mfoundi (code 15) à l'utilisateur 2  
CALL AffecterTerritoireUtilisateur(2, 'departement', 15, 1, 'Affectation test département Mfoundi');

-- Exemple 3: Affecter l'arrondissement Yaoundé I (code 56) à l'utilisateur 3
CALL AffecterTerritoireUtilisateur(3, 'arrondissement', 56, 1, 'Affectation test arrondissement Yaoundé I');
*/

-- =====================================================
-- 5. REQUÊTES DE VÉRIFICATION
-- =====================================================

-- Vérifier la structure de la nouvelle table
SELECT 'Structure de la table utilisateur_affectation_territoriale:' as info;
DESCRIBE utilisateur_affectation_territoriale;

-- Compter les nouvelles affectations
SELECT 
    'Nombre d\'affectations territoriales' as metric,
    COUNT(*) as count
FROM utilisateur_affectation_territoriale 
WHERE est_actif = 1;

-- Afficher toutes les affectations s'il y en a
SELECT 
    uta.code_utilisateur,
    uta.type_territorial,
    uta.code_territorial,
    uta.date_affectation,
    uta.notes
FROM utilisateur_affectation_territoriale uta
WHERE uta.est_actif = 1
LIMIT 10;

-- Résumé final
SELECT 
    'CONFIGURATION TERMINÉE AVEC SUCCÈS!' as message,
    'Tables créées: utilisateur_affectation_territoriale' as table_created,
    'Rôles ajoutés: 6 nouveaux rôles territoriaux' as roles_added,
    'Procédures créées: 3 procédures de gestion' as procedures_created;

SELECT 'Pour la prochaine étape, vous pouvez maintenant:' as next_steps;
SELECT '1. Tester les affectations avec AffecterTerritoireUtilisateur()' as step1;
SELECT '2. Implémenter le filtrage dans le frontend' as step2;
SELECT '3. Créer des utilisateurs de test avec les nouveaux rôles' as step3;