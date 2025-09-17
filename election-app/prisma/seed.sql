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
DELETE FROM role_permission;
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

-- Insert Permissions
INSERT INTO permission (code, nom_permission, description, code_createur, date_creation) VALUES
-- System Admin Permissions (1-10)
(1, 'system.admin', 'Full system administration access', 1, NOW()::VARCHAR),
(2, 'system.config', 'System configuration management', 1, NOW()::VARCHAR),
(3, 'system.logs', 'View system logs and audit trails', 1, NOW()::VARCHAR),

-- User Management Permissions (11-20)
(11, 'users.create', 'Create new users', 1, NOW()::VARCHAR),
(12, 'users.read', 'View user information', 1, NOW()::VARCHAR),
(13, 'users.update', 'Update user information', 1, NOW()::VARCHAR),
(14, 'users.delete', 'Delete users', 1, NOW()::VARCHAR),
(15, 'users.manage_roles', 'Assign and manage user roles', 1, NOW()::VARCHAR),
(16, 'users.manage_departments', 'Assign users to departments', 1, NOW()::VARCHAR),

-- Role and Permission Management (21-30)
(21, 'roles.create', 'Create new roles', 1, NOW()::VARCHAR),
(22, 'roles.read', 'View roles and permissions', 1, NOW()::VARCHAR),
(23, 'roles.update', 'Update roles and permissions', 1, NOW()::VARCHAR),
(24, 'roles.delete', 'Delete roles', 1, NOW()::VARCHAR),
(25, 'permissions.manage', 'Manage system permissions', 1, NOW()::VARCHAR),

-- Data Access Permissions (31-50)
(31, 'data.view_all', 'View all election data nationwide', 1, NOW()::VARCHAR),
(32, 'data.edit_all', 'Edit all election data nationwide', 1, NOW()::VARCHAR),
(33, 'data.view_region', 'View election data for assigned regions', 1, NOW()::VARCHAR),
(34, 'data.edit_region', 'Edit election data for assigned regions', 1, NOW()::VARCHAR),
(35, 'data.view_department', 'View election data for assigned departments', 1, NOW()::VARCHAR),
(36, 'data.edit_department', 'Edit election data for assigned departments', 1, NOW()::VARCHAR),
(37, 'data.view_arrondissement', 'View election data for assigned arrondissements', 1, NOW()::VARCHAR),
(38, 'data.edit_arrondissement', 'Edit election data for assigned arrondissements', 1, NOW()::VARCHAR),
(39, 'data.view_bureau', 'View election data for assigned bureaus', 1, NOW()::VARCHAR),
(40, 'data.edit_bureau', 'Edit election data for assigned bureaus', 1, NOW()::VARCHAR),

-- Participation Management (51-60)
(51, 'participation.view', 'View participation data', 1, NOW()::VARCHAR),
(52, 'participation.create', 'Create participation records', 1, NOW()::VARCHAR),
(53, 'participation.edit', 'Edit participation data', 1, NOW()::VARCHAR),
(54, 'participation.delete', 'Delete participation records', 1, NOW()::VARCHAR),
(55, 'participation.validate', 'Validate participation data', 1, NOW()::VARCHAR),
(56, 'participation.manage', 'Full participation data management', 1, NOW()::VARCHAR),

-- Results Management (61-70)
(61, 'results.view', 'View election results', 1, NOW()::VARCHAR),
(62, 'results.create', 'Create result records', 1, NOW()::VARCHAR),
(63, 'results.edit', 'Edit election results', 1, NOW()::VARCHAR),
(64, 'results.delete', 'Delete result records', 1, NOW()::VARCHAR),
(65, 'results.validate', 'Validate election results', 1, NOW()::VARCHAR),
(66, 'results.manage', 'Full results management', 1, NOW()::VARCHAR),
(67, 'results.publish', 'Publish official results', 1, NOW()::VARCHAR),

-- Redressements (Corrections) Management (71-80)
(71, 'redressements.view', 'View corrections and redressements', 1, NOW()::VARCHAR),
(72, 'redressements.create', 'Create correction records', 1, NOW()::VARCHAR),
(73, 'redressements.edit', 'Edit corrections', 1, NOW()::VARCHAR),
(74, 'redressements.delete', 'Delete correction records', 1, NOW()::VARCHAR),
(75, 'redressements.approve', 'Approve corrections', 1, NOW()::VARCHAR),
(76, 'redressements.manage', 'Full corrections management', 1, NOW()::VARCHAR),

-- PV (Procès-Verbal) Management (81-90)
(81, 'pv.view', 'View PV documents', 1, NOW()::VARCHAR),
(82, 'pv.upload', 'Upload PV documents', 1, NOW()::VARCHAR),
(83, 'pv.download', 'Download PV documents', 1, NOW()::VARCHAR),
(84, 'pv.validate', 'Validate PV documents', 1, NOW()::VARCHAR),
(85, 'pv.manage', 'Full PV document management', 1, NOW()::VARCHAR),

-- Commission Management (91-100)
(91, 'commission.view', 'View commission information', 1, NOW()::VARCHAR),
(92, 'commission.create', 'Create commission records', 1, NOW()::VARCHAR),
(93, 'commission.edit', 'Edit commission information', 1, NOW()::VARCHAR),
(94, 'commission.delete', 'Delete commission records', 1, NOW()::VARCHAR),
(95, 'commission.manage_members', 'Manage commission members', 1, NOW()::VARCHAR),
(96, 'commission.manage', 'Full commission management', 1, NOW()::VARCHAR),

-- Reporting and Analytics (101-110)
(101, 'reports.view', 'View reports and analytics', 1, NOW()::VARCHAR),
(102, 'reports.create', 'Create custom reports', 1, NOW()::VARCHAR),
(103, 'reports.export', 'Export reports and data', 1, NOW()::VARCHAR),
(104, 'reports.schedule', 'Schedule automated reports', 1, NOW()::VARCHAR),
(105, 'analytics.view', 'View analytics dashboard', 1, NOW()::VARCHAR),
(106, 'analytics.advanced', 'Access advanced analytics', 1, NOW()::VARCHAR),

-- Bureau de Vote Management (111-120)
(111, 'bureau.view', 'View bureau de vote information', 1, NOW()::VARCHAR),
(112, 'bureau.create', 'Create bureau de vote records', 1, NOW()::VARCHAR),
(113, 'bureau.edit', 'Edit bureau de vote information', 1, NOW()::VARCHAR),
(114, 'bureau.delete', 'Delete bureau de vote records', 1, NOW()::VARCHAR),
(115, 'bureau.manage', 'Full bureau de vote management', 1, NOW()::VARCHAR),

-- Geographical Management (121-130)
(121, 'geo.view', 'View geographical data', 1, NOW()::VARCHAR),
(122, 'geo.create', 'Create geographical records', 1, NOW()::VARCHAR),
(123, 'geo.edit', 'Edit geographical information', 1, NOW()::VARCHAR),
(124, 'geo.delete', 'Delete geographical records', 1, NOW()::VARCHAR),
(125, 'geo.manage', 'Full geographical data management', 1, NOW()::VARCHAR),

-- Audit and Monitoring (131-140)
(131, 'audit.view', 'View audit logs', 1, NOW()::VARCHAR),
(132, 'audit.export', 'Export audit data', 1, NOW()::VARCHAR),
(133, 'monitoring.view', 'View system monitoring', 1, NOW()::VARCHAR),
(134, 'monitoring.alerts', 'Manage monitoring alerts', 1, NOW()::VARCHAR);

-- Insert Roles
INSERT INTO role (libelle) VALUES
('Administrateur Système'),
('Superviseur National'),
('Responsable Régional'),
('Responsable Départemental'),
('Opérateur de Saisie'),
('Observateur');

-- Insert Role-Permission Mappings
-- Administrateur Système (Role 1) - Full access to everything
INSERT INTO role_permission (code_role, code_permission) VALUES
-- System admin permissions
(1, 1), (1, 2), (1, 3),
-- User management
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16),
-- Role and permission management
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25),
-- Data access - all levels
(1, 31), (1, 32), (1, 33), (1, 34), (1, 35), (1, 36), (1, 37), (1, 38), (1, 39), (1, 40),
-- Participation management
(1, 51), (1, 52), (1, 53), (1, 54), (1, 55), (1, 56),
-- Results management
(1, 61), (1, 62), (1, 63), (1, 64), (1, 65), (1, 66), (1, 67),
-- Redressements management
(1, 71), (1, 72), (1, 73), (1, 74), (1, 75), (1, 76),
-- PV management
(1, 81), (1, 82), (1, 83), (1, 84), (1, 85),
-- Commission management
(1, 91), (1, 92), (1, 93), (1, 94), (1, 95), (1, 96),
-- Reporting and analytics
(1, 101), (1, 102), (1, 103), (1, 104), (1, 105), (1, 106),
-- Bureau management
(1, 111), (1, 112), (1, 113), (1, 114), (1, 115),
-- Geographical management
(1, 121), (1, 122), (1, 123), (1, 124), (1, 125),
-- Audit and monitoring
(1, 131), (1, 132), (1, 133), (1, 134);

-- Superviseur National (Role 2) - National oversight and reporting
INSERT INTO role_permission (code_role, code_permission) VALUES
-- Data access - national level
(2, 31), (2, 33), (2, 35), (2, 37), (2, 39),
-- Participation - view and validate
(2, 51), (2, 55),
-- Results - view, validate, and publish
(2, 61), (2, 65), (2, 67),
-- Redressements - view and approve
(2, 71), (2, 75),
-- PV management - view and validate
(2, 81), (2, 84),
-- Commission - view
(2, 91),
-- Reporting and analytics - full access
(2, 101), (2, 102), (2, 103), (2, 104), (2, 105), (2, 106),
-- Bureau - view
(2, 111),
-- Geographical - view
(2, 121),
-- User management - limited
(2, 12),
-- Audit - view
(2, 131);

-- Responsable Régional (Role 3) - Regional level management
INSERT INTO role_permission (code_role, code_permission) VALUES
-- Data access - regional level
(3, 33), (3, 34), (3, 35), (3, 36), (3, 37), (3, 38),
-- Participation - manage within region
(3, 51), (3, 52), (3, 53), (3, 55),
-- Results - manage within region
(3, 61), (3, 62), (3, 63), (3, 65),
-- Redressements - view and create
(3, 71), (3, 72), (3, 73),
-- PV management - regional access
(3, 81), (3, 82), (3, 83),
-- Commission - view and edit
(3, 91), (3, 93),
-- Reporting - view and create
(3, 101), (3, 102), (3, 103),
-- Bureau - view and edit
(3, 111), (3, 113),
-- Geographical - view
(3, 121),
-- User management - view assigned users
(3, 12),
-- Analytics - view
(3, 105);

-- Responsable Départemental (Role 4) - Department level management
INSERT INTO role_permission (code_role, code_permission) VALUES
-- Data access - department level
(4, 35), (4, 36), (4, 37), (4, 38), (4, 39), (4, 40),
-- Participation - full management at department level
(4, 51), (4, 52), (4, 53), (4, 54), (4, 55), (4, 56),
-- Results - manage department results
(4, 61), (4, 62), (4, 63), (4, 64), (4, 65),
-- Redressements - create and manage
(4, 71), (4, 72), (4, 73), (4, 76),
-- PV management - full access for department
(4, 81), (4, 82), (4, 83), (4, 84), (4, 85),
-- Commission - manage department commission
(4, 91), (4, 92), (4, 93), (4, 95), (4, 96),
-- Reporting - department reports
(4, 101), (4, 102), (4, 103),
-- Bureau - full management
(4, 111), (4, 112), (4, 113), (4, 114), (4, 115),
-- Geographical - view and edit department data
(4, 121), (4, 123),
-- User management - view department users
(4, 12),
-- Analytics - view
(4, 105);

-- Opérateur de Saisie (Role 5) - Data entry operator
INSERT INTO role_permission (code_role, code_permission) VALUES
-- Data access - assigned areas only
(5, 39), (5, 40),
-- Participation - create and edit
(5, 51), (5, 52), (5, 53),
-- Results - create and edit
(5, 61), (5, 62), (5, 63),
-- Redressements - view and create
(5, 71), (5, 72),
-- PV management - upload and view
(5, 81), (5, 82),
-- Bureau - view and edit assigned bureaus
(5, 111), (5, 113),
-- Geographical - view
(5, 121);

-- Observateur (Role 6) - Observer with read-only access
INSERT INTO role_permission (code_role, code_permission) VALUES
-- Data access - view only
(6, 39),
-- Participation - view only
(6, 51),
-- Results - view only
(6, 61),
-- Redressements - view only
(6, 71),
-- PV - view only
(6, 81),
-- Commission - view only
(6, 91),
-- Reports - view only
(6, 101),
-- Bureau - view only
(6, 111),
-- Geographical - view only
(6, 121);

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