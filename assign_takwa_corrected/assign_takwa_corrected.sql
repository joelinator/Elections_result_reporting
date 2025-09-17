-- =====================================================
-- AFFECTATION CORRIGÉE DE TAKWA HABIB PALAY COMME OBSERVATEUR REGIONAL
-- =====================================================

-- 1. Afficher l'utilisateur actuel avec son rôle
SELECT 'Utilisateur TAKWA - État actuel:' as info;
SELECT 
    u.code,
    u.username,
    u.noms_prenoms,
    u.email,
    u.code_role,
    r.libelle as role_actuel
FROM utilisateur u
LEFT JOIN role r ON u.code_role = r.code
WHERE u.code = 2;

-- 2. Mettre à jour le rôle de TAKWA vers observateur_regional (code 5)
UPDATE utilisateur 
SET code_role = 5 
WHERE code = 2;

SELECT 'Rôle mis à jour vers observateur_regional pour TAKWA HABIB PALAY!' as status;

-- 3. Vérifier la mise à jour
SELECT 'TAKWA - Nouveau rôle:' as info;
SELECT 
    u.code,
    u.noms_prenoms,
    u.code_role,
    r.libelle as nouveau_role
FROM utilisateur u
LEFT JOIN role r ON u.code_role = r.code
WHERE u.code = 2;

-- 4. Afficher les régions disponibles pour affectation territoriale
SELECT 'Régions disponibles pour affectation:' as info;
SELECT code, libelle FROM region ORDER BY code;

-- 5. Exemples d'affectation territoriale (décommentez selon vos besoins)
-- Remplacez les codes région par les vrais codes de votre base

/*
-- Exemple: Affecter la région Centre (remplacez 2 par le vrai code)
CALL AffecterTerritoireUtilisateur(2, 'region', 2, 1, 'Observateur pour la région Centre');

-- Exemple: Affecter la région Extrême-Nord (remplacez 4 par le vrai code)  
CALL AffecterTerritoireUtilisateur(2, 'region', 4, 1, 'Observateur pour la région Extrême-Nord');
*/

SELECT 'Pour affecter des territoires, décommentez les lignes CALL ci-dessus avec les vrais codes région' as instruction;

-- 6. Vérifier les territoires actuellement affectés à TAKWA
SELECT 'Territoires affectés à TAKWA:' as info;
SELECT 
    uta.type_territorial,
    uta.code_territorial,
    CASE 
        WHEN uta.type_territorial = 'region' THEN 
            (SELECT libelle FROM region WHERE code = uta.code_territorial)
        WHEN uta.type_territorial = 'departement' THEN 
            (SELECT libelle FROM departement WHERE code = uta.code_territorial)
        WHEN uta.type_territorial = 'arrondissement' THEN 
            (SELECT libelle FROM arrondissement WHERE code = uta.code_territorial)
        ELSE 'Territoire inconnu'
    END as nom_territoire,
    uta.date_affectation,
    uta.notes
FROM utilisateur_affectation_territoriale uta
WHERE uta.code_utilisateur = 2 AND uta.est_actif = 1;

-- 7. Résumé final
SELECT 'Configuration terminée!' as message;
SELECT 'TAKWA HABIB PALAY est maintenant observateur_regional' as nouveau_statut;
SELECT 'Prochaine étape: affecter des régions spécifiques' as prochaine_etape;