-- Database seed script for Elections Result Reporting
-- This script populates the database with realistic synthetic data for Cameroon's election system

-- Clear existing data (in correct order due to foreign key constraints)
DELETE FROM redressement_candidat;
DELETE FROM redressement_bureau_vote;
DELETE FROM resultat_departement;
DELETE FROM participation_departement;
DELETE FROM utilisateur_affectation_territoriale;
DELETE FROM utilisateur_departement;
DELETE FROM utilisateur_arrondissement;
DELETE FROM utilisateur_bureau_vote;
DELETE FROM utilisateur_region;
DELETE FROM pv_arrondissement;
DELETE FROM membre_commision;
DELETE FROM commission_departementale;
DELETE FROM bureau_vote;
DELETE FROM arrondissement;
DELETE FROM parti_politique;
DELETE FROM candidat;
DELETE FROM utilisateur;
DELETE FROM departement;
DELETE FROM region;
DELETE FROM role;
DELETE FROM fonction_commision;
DELETE FROM permission;

-- Reset sequences
ALTER SEQUENCE region_code_seq RESTART WITH 1;
ALTER SEQUENCE departement_code_seq RESTART WITH 1;
ALTER SEQUENCE arrondissement_code_seq RESTART WITH 1;
ALTER SEQUENCE bureau_vote_code_seq RESTART WITH 1;
ALTER SEQUENCE candidat_code_seq RESTART WITH 1;
ALTER SEQUENCE parti_politique_code_seq RESTART WITH 1;
ALTER SEQUENCE role_code_seq RESTART WITH 1;
ALTER SEQUENCE utilisateur_code_seq RESTART WITH 1;
ALTER SEQUENCE participation_departement_code_seq RESTART WITH 1;
ALTER SEQUENCE resultat_departement_code_seq RESTART WITH 1;

-- Insert Regions (10 regions of Cameroon)
INSERT INTO region (abbreviation, libelle, chef_lieu, description, code_createur, date_creation) VALUES
('AD', 'Adamaoua', 'Ngaoundéré', 'Région de l''Adamaoua', 'SYSTEM', NOW()::VARCHAR),
('CE', 'Centre', 'Yaoundé', 'Région du Centre', 'SYSTEM', NOW()::VARCHAR),
('ES', 'Est', 'Bertoua', 'Région de l''Est', 'SYSTEM', NOW()::VARCHAR),
('EN', 'Extrême-Nord', 'Maroua', 'Région de l''Extrême-Nord', 'SYSTEM', NOW()::VARCHAR),
('LT', 'Littoral', 'Douala', 'Région du Littoral', 'SYSTEM', NOW()::VARCHAR),
('NO', 'Nord', 'Garoua', 'Région du Nord', 'SYSTEM', NOW()::VARCHAR),
('NW', 'Nord-Ouest', 'Bamenda', 'Région du Nord-Ouest', 'SYSTEM', NOW()::VARCHAR),
('OU', 'Ouest', 'Bafoussam', 'Région de l''Ouest', 'SYSTEM', NOW()::VARCHAR),
('SU', 'Sud', 'Ebolowa', 'Région du Sud', 'SYSTEM', NOW()::VARCHAR),
('SW', 'Sud-Ouest', 'Buea', 'Région du Sud-Ouest', 'SYSTEM', NOW()::VARCHAR);

-- Insert some key departments
INSERT INTO departement (abbreviation, chef_lieu, libelle, description, code_createur, date_creation, code_region) VALUES
('WOU', 'Douala', 'Wouri', 'Département du Wouri', 'SYSTEM', NOW()::VARCHAR, 5),
('MFO', 'Yaoundé', 'Mfoundi', 'Département de la Mfoundi', 'SYSTEM', NOW()::VARCHAR, 2),
('FAK', 'Limbe', 'Fako', 'Département du Fako', 'SYSTEM', NOW()::VARCHAR, 10),
('MEN', 'Foumban', 'Noun', 'Département du Noun', 'SYSTEM', NOW()::VARCHAR, 8),
('LYM', 'Tibati', 'Djérem', 'Département du Djérem', 'SYSTEM', NOW()::VARCHAR, 1),
('HNY', 'Ebolowa', 'Mvila', 'Département de la Mvila', 'SYSTEM', NOW()::VARCHAR, 9),
('BUI', 'Kumbo', 'Bui', 'Département du Bui', 'SYSTEM', NOW()::VARCHAR, 7),
('MAY', 'Maroua', 'Diamaré', 'Département du Diamaré', 'SYSTEM', NOW()::VARCHAR, 4),
('BER', 'Bertoua', 'Lom-et-Djérem', 'Département du Lom-et-Djérem', 'SYSTEM', NOW()::VARCHAR, 3),
('GAR', 'Garoua', 'Bénoué', 'Département de la Bénoué', 'SYSTEM', NOW()::VARCHAR, 6);

-- Insert Arrondissements (5 per department)
INSERT INTO arrondissement (code_departement, code_region, abbreviation, libelle, description, code_createur, date_creation) VALUES
-- Wouri arrondissements
(1, 5, 'DA1', 'Douala 1er', 'Arrondissement de Douala 1er', 'SYSTEM', NOW()::VARCHAR),
(1, 5, 'DA2', 'Douala 2ème', 'Arrondissement de Douala 2ème', 'SYSTEM', NOW()::VARCHAR),
(1, 5, 'DA3', 'Douala 3ème', 'Arrondissement de Douala 3ème', 'SYSTEM', NOW()::VARCHAR),
(1, 5, 'DA4', 'Douala 4ème', 'Arrondissement de Douala 4ème', 'SYSTEM', NOW()::VARCHAR),
(1, 5, 'DA5', 'Douala 5ème', 'Arrondissement de Douala 5ème', 'SYSTEM', NOW()::VARCHAR),
-- Mfoundi arrondissements
(2, 2, 'YA1', 'Yaoundé 1er', 'Arrondissement de Yaoundé 1er', 'SYSTEM', NOW()::VARCHAR),
(2, 2, 'YA2', 'Yaoundé 2ème', 'Arrondissement de Yaoundé 2ème', 'SYSTEM', NOW()::VARCHAR),
(2, 2, 'YA3', 'Yaoundé 3ème', 'Arrondissement de Yaoundé 3ème', 'SYSTEM', NOW()::VARCHAR),
(2, 2, 'YA4', 'Yaoundé 4ème', 'Arrondissement de Yaoundé 4ème', 'SYSTEM', NOW()::VARCHAR),
(2, 2, 'YA5', 'Yaoundé 5ème', 'Arrondissement de Yaoundé 5ème', 'SYSTEM', NOW()::VARCHAR),
-- Fako arrondissements
(3, 10, 'LIM', 'Limbe', 'Arrondissement de Limbe', 'SYSTEM', NOW()::VARCHAR),
(3, 10, 'BUE', 'Buea', 'Arrondissement de Buea', 'SYSTEM', NOW()::VARCHAR),
(3, 10, 'TIK', 'Tiko', 'Arrondissement de Tiko', 'SYSTEM', NOW()::VARCHAR),
(3, 10, 'MUY', 'Muyuka', 'Arrondissement de Muyuka', 'SYSTEM', NOW()::VARCHAR),
(3, 10, 'WES', 'West Coast', 'Arrondissement de West Coast', 'SYSTEM', NOW()::VARCHAR);

-- Insert Bureau de Vote (10 per arrondissement for first 3 arrondissements)
INSERT INTO bureau_vote (designation, description, latitude, longitude, altititude, data_filled, code_arrondissement, code_createur, date_creation, data_incoherent, effectif) VALUES
-- Douala 1er bureaux
('Bureau de Vote Akwa Nord', 'École Publique Akwa Nord', 4.0511, 9.7679, 13, 1, 1, 'SYSTEM', NOW()::VARCHAR, 0, 450),
('Bureau de Vote Bonanjo', 'École Publique Bonanjo', 4.0483, 9.7542, 15, 1, 1, 'SYSTEM', NOW()::VARCHAR, 0, 520),
('Bureau de Vote Bell', 'École Publique Bell', 4.0456, 9.7721, 12, 0, 1, 'SYSTEM', NOW()::VARCHAR, 0, 380),
('Bureau de Vote Bonapriso', 'École Publique Bonapriso', 4.0425, 9.7598, 18, 1, 1, 'SYSTEM', NOW()::VARCHAR, 0, 410),
('Bureau de Vote Deido', 'École Publique Deido', 4.0612, 9.7845, 8, 1, 1, 'SYSTEM', NOW()::VARCHAR, 0, 490),
-- Douala 2ème bureaux
('Bureau de Vote New Bell', 'École Publique New Bell', 4.0789, 9.7234, 25, 1, 2, 'SYSTEM', NOW()::VARCHAR, 0, 680),
('Bureau de Vote Ndokoti', 'École Publique Ndokoti', 4.0695, 9.7456, 22, 1, 2, 'SYSTEM', NOW()::VARCHAR, 0, 590),
('Bureau de Vote Bépanda', 'École Publique Bépanda', 4.0723, 9.7389, 28, 0, 2, 'SYSTEM', NOW()::VARCHAR, 0, 650),
('Bureau de Vote Kotto', 'École Publique Kotto', 4.0834, 9.7567, 31, 1, 2, 'SYSTEM', NOW()::VARCHAR, 0, 720),
('Bureau de Vote Logbaba', 'École Publique Logbaba', 4.0912, 9.7123, 35, 1, 2, 'SYSTEM', NOW()::VARCHAR, 0, 480),
-- Yaoundé 1er bureaux
('Bureau de Vote Centre Ville', 'École Publique Centre Ville', 3.8667, 11.5167, 760, 1, 6, 'SYSTEM', NOW()::VARCHAR, 0, 420),
('Bureau de Vote Nlongkak', 'École Publique Nlongkak', 3.8789, 11.5234, 765, 1, 6, 'SYSTEM', NOW()::VARCHAR, 0, 380),
('Bureau de Vote Messa', 'École Publique Messa', 3.8834, 11.5089, 780, 0, 6, 'SYSTEM', NOW()::VARCHAR, 0, 510),
('Bureau de Vote Essos', 'École Publique Essos', 3.8912, 11.5345, 785, 1, 6, 'SYSTEM', NOW()::VARCHAR, 0, 450),
('Bureau de Vote Mvog-Ada', 'École Publique Mvog-Ada', 3.8723, 11.5278, 770, 1, 6, 'SYSTEM', NOW()::VARCHAR, 0, 490);

-- Insert Roles
INSERT INTO role (libelle) VALUES
('Administrateur Système'),
('Coordinateur Régional'),
('Superviseur Départemental'),
('Validateur Départemental'),
('Opérateur de Saisie'),
('Observateur');

-- Insert Candidates
INSERT INTO candidat (noms_prenoms, photo, date_creation, code_createur) VALUES
('Paul BIYA', '/images/candidates/biya.jpg', NOW()::VARCHAR, 'SYSTEM'),
('Maurice KAMTO', '/images/candidates/kamto.jpg', NOW()::VARCHAR, 'SYSTEM'),
('Cabral LIBII', '/images/candidates/libii.jpg', NOW()::VARCHAR, 'SYSTEM'),
('Akere MUNA', '/images/candidates/muna.jpg', NOW()::VARCHAR, 'SYSTEM'),
('Serge ESPOIR', '/images/candidates/espoir.jpg', NOW()::VARCHAR, 'SYSTEM');

-- Insert Political Parties
INSERT INTO parti_politique (designation, abbreviation, description, coloration_bulletin, image, code_candidat, code_createur, date_creation) VALUES
('Rassemblement Démocratique du Peuple Camerounais', 'RDPC', 'Parti au pouvoir depuis 1985', 'Vert', '/images/parties/rdpc.png', 1, 'SYSTEM', NOW()::VARCHAR),
('Mouvement pour la Renaissance du Cameroun', 'MRC', 'Principal parti d''opposition', 'Blanc', '/images/parties/mrc.png', 2, 'SYSTEM', NOW()::VARCHAR),
('Parti Camerounais pour la Réconciliation Nationale', 'PCRN', 'Parti de la réconciliation', 'Jaune', '/images/parties/pcrn.png', 3, 'SYSTEM', NOW()::VARCHAR),
('Front pour le Salut National du Cameroun', 'FSNC', 'Front de salut national', 'Rouge', '/images/parties/fsnc.png', 4, 'SYSTEM', NOW()::VARCHAR),
('Univers', 'UNIVERS', 'Parti Univers', 'Bleu', '/images/parties/univers.png', 5, 'SYSTEM', NOW()::VARCHAR);

-- Insert Users
INSERT INTO utilisateur (noms_prenoms, email, password, username, code_role, boite_postale, adresse, contact, code_createur, date_creation, statut_vie) VALUES
('Administrateur Système', 'admin@elections.cm', 'admin123', 'admin', 1, 'BP 1001', 'Yaoundé', '+237 677 123 456', 'SYSTEM', NOW()::VARCHAR, 1),
('Jean MBALLA', 'jean.mballa@elections.cm', 'password123', 'jmballa', 4, 'BP 1002', 'Douala', '+237 677 234 567', 'admin', NOW()::VARCHAR, 1),
('Marie NGONO', 'marie.ngono@elections.cm', 'password123', 'mngono', 4, 'BP 1003', 'Yaoundé', '+237 677 345 678', 'admin', NOW()::VARCHAR, 1),
('Paul ATANGANA', 'paul.atangana@elections.cm', 'password123', 'patangana', 5, 'BP 1004', 'Buea', '+237 677 456 789', 'admin', NOW()::VARCHAR, 1),
('Alice FOUDA', 'alice.fouda@elections.cm', 'password123', 'afouda', 5, 'BP 1005', 'Bafoussam', '+237 677 567 890', 'admin', NOW()::VARCHAR, 1);

-- Insert User Department Assignments
INSERT INTO utilisateur_departement (code_departement, code_utilisateur) VALUES
(1, 2), -- Jean MBALLA -> Wouri
(2, 3), -- Marie NGONO -> Mfoundi
(3, 4), -- Paul ATANGANA -> Fako
(4, 5); -- Alice FOUDA -> Noun

-- Insert Participation Data
INSERT INTO participation_departement (
    code_departement, nombre_bureau_vote, nombre_inscrit, nombre_enveloppe_urnes,
    nombre_enveloppe_bulletins_differents, nombre_bulletin_electeur_identifiable,
    nombre_bulletin_enveloppes_signes, nombre_enveloppe_non_elecam,
    nombre_bulletin_non_elecam, nombre_bulletin_sans_enveloppe,
    nombre_enveloppe_vide, nombre_suffrages_valable, nombre_votant,
    bulletin_nul, suffrage_exprime, taux_participation, date_creation
) VALUES
(1, 125, 450000, 285000, 1250, 850, 950, 450, 320, 180, 220, 279500, 285000, 5500, 279500, 63.33, NOW()::VARCHAR),
(2, 98, 380000, 245000, 980, 720, 810, 380, 290, 150, 190, 241200, 245000, 3800, 241200, 64.47, NOW()::VARCHAR),
(3, 87, 290000, 198000, 870, 560, 640, 320, 240, 120, 160, 195800, 198000, 2200, 195800, 68.28, NOW()::VARCHAR);

-- Insert Election Results
INSERT INTO resultat_departement (code_departement, code_parti, nombre_vote, pourcentage, date_creation) VALUES
-- Wouri results
(1, 1, 165000, 59.05, NOW()::VARCHAR), -- RDPC
(1, 2, 75000, 26.83, NOW()::VARCHAR),  -- MRC
(1, 3, 25000, 8.94, NOW()::VARCHAR),   -- PCRN
(1, 4, 10000, 3.58, NOW()::VARCHAR),   -- FSNC
(1, 5, 4500, 1.61, NOW()::VARCHAR),    -- UNIVERS
-- Mfoundi results
(2, 1, 120000, 49.75, NOW()::VARCHAR), -- RDPC
(2, 2, 85000, 35.23, NOW()::VARCHAR),  -- MRC
(2, 3, 22000, 9.12, NOW()::VARCHAR),   -- PCRN
(2, 4, 9000, 3.73, NOW()::VARCHAR),    -- FSNC
(2, 5, 5200, 2.16, NOW()::VARCHAR),    -- UNIVERS
-- Fako results
(3, 1, 95000, 48.52, NOW()::VARCHAR),  -- RDPC
(3, 2, 78000, 39.84, NOW()::VARCHAR),  -- MRC
(3, 3, 15000, 7.66, NOW()::VARCHAR),   -- PCRN
(3, 4, 5500, 2.81, NOW()::VARCHAR),    -- FSNC
(3, 5, 2300, 1.17, NOW()::VARCHAR);    -- UNIVERS

-- Insert some redressements for demonstration
INSERT INTO redressement_candidat (code_bureau_vote, code_parti, nombre_vote_initial, nombre_vote_redresse, raison_redressement, date_redressement) VALUES
(1, 1, 250, 245, 'Erreur de comptage détectée lors de la vérification', NOW()),
(5, 2, 180, 185, 'Bulletin mal compté initialement', NOW()),
(12, 1, 320, 315, 'Correction suite à réclamation', NOW());

-- Insert Commission Functions
INSERT INTO fonction_commision (libelle, description) VALUES
('Président', 'Président de la commission départementale'),
('Vice-Président', 'Vice-président de la commission'),
('Secrétaire', 'Secrétaire de la commission'),
('Rapporteur', 'Rapporteur de la commission'),
('Membre', 'Membre ordinaire de la commission');

-- Insert Departmental Commissions
INSERT INTO commission_departementale (code_departement, libelle, description) VALUES
(1, 'Commission Départementale Wouri', 'Commission électorale du département du Wouri'),
(2, 'Commission Départementale Mfoundi', 'Commission électorale du département de la Mfoundi'),
(3, 'Commission Départementale Fako', 'Commission électorale du département du Fako');

-- Insert Commission Members
INSERT INTO membre_commision (nom, code_fonction, contact, email, est_membre_secretariat, code_commission) VALUES
('Dr. NKOMO Pierre', 1, '+237 677 111 222', 'nkomo@commission.cm', true, 1),
('Mme ESSOMBA Marie', 2, '+237 677 222 333', 'essomba@commission.cm', true, 1),
('M. OWONA Paul', 3, '+237 677 333 444', 'owona@commission.cm', true, 1),
('Mme BELLO Aissa', 1, '+237 677 444 555', 'bello@commission.cm', true, 2),
('M. TCHOUTA Jean', 2, '+237 677 555 666', 'tchouta@commission.cm', true, 2),
('Mme MANGA Rose', 1, '+237 677 666 777', 'manga@commission.cm', true, 3);

-- Add some PV files
INSERT INTO pv_arrondissement (code_arrondissement, url_pv, hash_file, libele) VALUES
(1, '/documents/pv/douala1_pv_2024.pdf', 'a1b2c3d4e5f6', 'PV Douala 1er - Election 2024'),
(2, '/documents/pv/douala2_pv_2024.pdf', 'b2c3d4e5f6g7', 'PV Douala 2ème - Election 2024'),
(6, '/documents/pv/yaounde1_pv_2024.pdf', 'c3d4e5f6g7h8', 'PV Yaoundé 1er - Election 2024');

COMMIT;