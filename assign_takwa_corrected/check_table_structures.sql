-- =====================================================
-- VÉRIFICATION DE LA STRUCTURE DES TABLES
-- =====================================================

-- Vérifier la structure de la table utilisateur
SELECT 'STRUCTURE TABLE UTILISATEUR:' as info;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'utilisateur'
ORDER BY ORDINAL_POSITION;

-- Vérifier la structure de la table role
SELECT 'STRUCTURE TABLE ROLE:' as info;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'role'
ORDER BY ORDINAL_POSITION;

-- Afficher quelques exemples de données de la table role
SELECT 'CONTENU TABLE ROLE:' as info;
SELECT * FROM role LIMIT 10;