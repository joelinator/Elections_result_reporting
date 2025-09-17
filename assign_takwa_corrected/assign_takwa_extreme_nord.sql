-- =====================================================
-- AFFECTATION TERRITORIALE DE TAKWA HABIB À EXTRÊME-NORD
-- =====================================================

-- 1. Vérifier l'état actuel de TAKWA HABIB
SELECT 'État actuel de TAKWA HABIB PALAY:' as info;
SELECT 
    u.code,
    u.noms_prenoms,
    u.code_role,
    r.libelle as role_actuel
FROM utilisateur u
LEFT JOIN role r ON u.code_role = r.code
WHERE u.code = 2;

-- 2. Trouver le code de la région Extrême-Nord
SELECT 'Recherche de la région Extrême-Nord:' as info;
SELECT 
    code,
    libelle,
    CASE 
        WHEN LOWER(libelle) LIKE '%extr%nord%' THEN '✅ Correspondance trouvée'
        WHEN LOWER(libelle) LIKE '%extreme%' THEN '✅ Correspondance trouvée'  
        WHEN LOWER(libelle) LIKE '%nord%' THEN '⚠️ Correspondance partielle'
        ELSE '❌ Pas de correspondance'
    END as correspondance
FROM region 
WHERE LOWER(libelle) LIKE '%extr%' 
   OR LOWER(libelle) LIKE '%nord%'
   OR LOWER(libelle) LIKE '%extreme%'
ORDER BY correspondance DESC, libelle;

-- 3. Afficher toutes les régions pour référence
SELECT 'Toutes les régions disponibles:' as info;
SELECT code, libelle FROM region ORDER BY code;

-- 4. Assigner TAKWA à la région Extrême-Nord
-- Note: Remplacez le code 4 par le vrai code de la région Extrême-Nord si différent
SET @code_extreme_nord = (
    SELECT code FROM region 
    WHERE LOWER(libelle) LIKE '%extr%nord%' 
       OR LOWER(libelle) LIKE '%extreme%nord%'
    LIMIT 1
);

-- Vérifier si on a trouvé la région
SELECT 
    CASE 
        WHEN @code_extreme_nord IS NOT NULL THEN CONCAT('Région Extrême-Nord trouvée avec le code: ', @code_extreme_nord)
        ELSE 'Région Extrême-Nord non trouvée automatiquement'
    END as recherche_region;

-- 5. Effectuer l'affectation territoriale (si la région est trouvée)
-- Si la région n'est pas trouvée automatiquement, décommentez et ajustez manuellement
SELECT 'Tentative d\'affectation territoriale:' as info;

-- Affectation automatique si région trouvée
SET @sql_affectation = CASE 
    WHEN @code_extreme_nord IS NOT NULL THEN 
        CONCAT('CALL AffecterTerritoireUtilisateur(2, ''region'', ', @code_extreme_nord, ', 1, ''Observateur régional pour Extrême-Nord'')')
    ELSE 'SELECT ''Veuillez affecter manuellement avec le bon code région'' as message'
END;

-- Exécuter l'affectation (décommentez la ligne suivante pour exécuter)
-- Si la région a été trouvée automatiquement, utilisez cette commande:
/*
CALL AffecterTerritoireUtilisateur(2, 'region', @code_extreme_nord, 1, 'Observateur régional pour Extrême-Nord');
*/

-- Si vous connaissez le code exact de la région Extrême-Nord, utilisez cette commande:
-- CALL AffecterTerritoireUtilisateur(2, 'region', [CODE_EXTREME_NORD], 1, 'Observateur régional pour Extrême-Nord');

-- Exemples avec codes possibles (décommentez celui qui correspond):
-- CALL AffecterTerritoireUtilisateur(2, 'region', 4, 1, 'Observateur régional pour Extrême-Nord');
-- CALL AffecterTerritoireUtilisateur(2, 'region', 10, 1, 'Observateur régional pour Extrême-Nord');

SELECT 'Pour finaliser l\'affectation, décommentez la ligne CALL appropriée ci-dessus' as instruction;

-- 6. Vérifier les affectations territoriales actuelles de TAKWA
SELECT 'Affectations territoriales actuelles de TAKWA:' as info;
SELECT 
    uta.code_utilisateur,
    u.noms_prenoms,
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
    uta.notes,
    uta.est_actif
FROM utilisateur_affectation_territoriale uta
JOIN utilisateur u ON uta.code_utilisateur = u.code
WHERE uta.code_utilisateur = 2
ORDER BY uta.date_affectation DESC;

-- 7. Résumé des actions à effectuer
SELECT 'Instructions finales:' as titre;
SELECT '1. Identifiez le code correct de la région Extrême-Nord dans la liste ci-dessus' as etape1;
SELECT '2. Décommentez et ajustez la ligne CALL avec le bon code région' as etape2;  
SELECT '3. Exécutez le script pour finaliser l\'affectation' as etape3;
SELECT '4. Vérifiez que TAKWA apparaît dans les affectations territoriales' as etape4;