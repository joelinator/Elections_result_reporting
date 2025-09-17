-- =====================================================
-- VÉRIFICATION DE LA CONFIGURATION TERRITORIALE
-- =====================================================

-- 1. Vérifier que la table utilisateur_affectation_territoriale a été créée
SELECT 
    'Table utilisateur_affectation_territoriale' as verification,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'utilisateur_affectation_territoriale'
        ) THEN '✅ Créée avec succès'
        ELSE '❌ Table manquante'
    END as statut;

-- 2. Vérifier que tous les nouveaux rôles territoriaux ont été ajoutés
SELECT 
    'Rôles territoriaux ajoutés' as verification,
    COUNT(*) as nombre_roles_territoriaux
FROM role 
WHERE libelle IN (
    'observateur_regional',
    'observateur_departemental', 
    'observateur_arrondissement',
    'validateur_regional',
    'validateur_departemental',
    'validateur_arrondissement'
);

-- 3. Afficher tous les rôles territoriaux
SELECT 
    code,
    libelle,
    description
FROM role 
WHERE libelle LIKE '%observateur_%' OR libelle LIKE '%validateur_%'
ORDER BY libelle;

-- 4. Vérifier que les procédures stockées ont été créées
SELECT 
    ROUTINE_NAME as nom_procedure,
    ROUTINE_TYPE as type,
    CREATED as date_creation
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = DATABASE() 
AND ROUTINE_NAME IN (
    'AffecterTerritoireUtilisateur',
    'SupprimerTerritoireUtilisateur', 
    'UtilisateurAccesTerritoire'
)
ORDER BY ROUTINE_NAME;

-- 5. Structure de la table d'affectation territoriale
DESCRIBE utilisateur_affectation_territoriale;

-- 6. Afficher un résumé de la configuration
SELECT 
    'Configuration terminée!' as message,
    'Vous pouvez maintenant:' as prochaines_etapes_titre,
    '1. Affecter des territoires aux utilisateurs' as etape1,
    '2. Tester les procédures stockées' as etape2,
    '3. Implémenter le filtrage dans le frontend' as etape3;