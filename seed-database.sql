-- Database seeding script with synthetic data for election application
-- This script populates the database with realistic test data

-- Clear existing data (be careful in production)
TRUNCATE TABLE 
  utilisateur_affectation_territoriale,
  utilisateur_departement,
  utilisateur_arrondissement,
  utilisateur_bureau_vote,
  utilisateur_region,
  redressement_candidat,
  redressement_bureau_vote,
  resultat_departement,
  participation_departement,
  bureau_vote,
  arrondissement,
  departement,
  region,
  parti_politique,
  candidat,
  utilisateur,
  role,
  permission,
  role_permission,
  journal,
  pv_arrondissement,
  commission_departementale,
  membre_commision,
  fonction_commision
RESTART IDENTITY CASCADE;

-- Insert Regions (10 regions of Cameroon)
INSERT INTO region (code, abbreviation, libelle, chef_lieu, description, date_creation) VALUES
(1, 'AD', 'Adamaoua', 'Ngaoundéré', 'Region de l''Adamaoua au centre du Cameroun', NOW()::text),
(2, 'CE', 'Centre', 'Yaoundé', 'Region du Centre, capitale politique', NOW()::text),
(3, 'ES', 'Est', 'Bertoua', 'Region de l''Est forestière', NOW()::text),
(4, 'EN', 'Extrême-Nord', 'Maroua', 'Region de l''Extrême-Nord, zone sahélienne', NOW()::text),
(5, 'LT', 'Littoral', 'Douala', 'Region du Littoral, capitale économique', NOW()::text),
(6, 'NO', 'Nord', 'Garoua', 'Region du Nord, zone soudanienne', NOW()::text),
(7, 'NW', 'Nord-Ouest', 'Bamenda', 'Region anglophone du Nord-Ouest', NOW()::text),
(8, 'OU', 'Ouest', 'Bafoussam', 'Region de l''Ouest, pays Bamiléké', NOW()::text),
(9, 'SU', 'Sud', 'Ebolowa', 'Region du Sud forestière', NOW()::text),
(10, 'SW', 'Sud-Ouest', 'Buea', 'Region anglophone du Sud-Ouest', NOW()::text);

-- Insert Departments (58 departments)
INSERT INTO departement (code, abbreviation, chef_lieu, libelle, description, code_region, date_creation) VALUES
-- Centre Region
(1, 'HNY', 'Obala', 'Haute-Nyong', 'Département de la Haute-Nyong', 2, NOW()::text),
(2, 'LKE', 'Monatélé', 'Lekié', 'Département de la Lekié', 2, NOW()::text),
(3, 'MBM', 'Mbalmayo', 'Mbam-et-Inoubou', 'Département du Mbam-et-Inoubou', 2, NOW()::text),
(4, 'MKI', 'Bafia', 'Mbam-et-Kim', 'Département du Mbam-et-Kim', 2, NOW()::text),
(5, 'MFI', 'Yaoundé', 'Mfoundi', 'Département du Mfoundi (Yaoundé)', 2, NOW()::text),
(6, 'MFM', 'Akonolinga', 'Mefou-et-Afamba', 'Département du Mefou-et-Afamba', 2, NOW()::text),
(7, 'MFA', 'Mfou', 'Mefou-et-Akono', 'Département du Mefou-et-Akono', 2, NOW()::text),
(8, 'NYK', 'Abong-Mbang', 'Nyong-et-Kélé', 'Département du Nyong-et-Kélé', 2, NOW()::text),
(9, 'NYM', 'Mbalmayo', 'Nyong-et-Mfoumou', 'Département du Nyong-et-Mfoumou', 2, NOW()::text),
(10, 'NYS', 'Eséka', 'Nyong-et-So''o', 'Département du Nyong-et-So''o', 2, NOW()::text),

-- Littoral Region
(11, 'MNG', 'Édéa', 'Mungo', 'Département du Mungo', 5, NOW()::text),
(12, 'NYL', 'Dizangué', 'Nkam', 'Département du Nkam', 5, NOW()::text),
(13, 'SNG', 'Sangmélima', 'Sanaga-Maritime', 'Département de la Sanaga-Maritime', 5, NOW()::text),
(14, 'WRI', 'Douala', 'Wouri', 'Département du Wouri (Douala)', 5, NOW()::text),

-- West Region
(15, 'BMB', 'Mbouda', 'Bamboutos', 'Département des Bamboutos', 8, NOW()::text),
(16, 'HNK', 'Bangangté', 'Haut-Nkam', 'Département du Haut-Nkam', 8, NOW()::text),
(17, 'HPL', 'Bafoussam', 'Hauts-Plateaux', 'Département des Hauts-Plateaux', 8, NOW()::text),
(18, 'KNG', 'Bandjoun', 'Koung-Khi', 'Département du Koung-Khi', 8, NOW()::text),
(19, 'MFI', 'Dschang', 'Menoua', 'Département de la Menoua', 8, NOW()::text),
(20, 'MFM', 'Foumban', 'Noun', 'Département du Noun', 8, NOW()::text),

-- Nord-Ouest Region
(21, 'BUI', 'Kumbo', 'Bui', 'Département du Bui', 7, NOW()::text),
(22, 'DON', 'Ndu', 'Donga-Mantung', 'Département du Donga-Mantung', 7, NOW()::text),
(23, 'MEZ', 'Bamenda', 'Mezam', 'Département du Mezam', 7, NOW()::text),
(24, 'MOK', 'Mbengwi', 'Momo', 'Département du Momo', 7, NOW()::text),
(25, 'NGK', 'Ndop', 'Ngo-Ketunjia', 'Département du Ngo-Ketunjia', 7, NOW()::text),

-- Sud-Ouest Region  
(26, 'FAK', 'Limbe', 'Fako', 'Département du Fako', 10, NOW()::text),
(27, 'KUP', 'Tombel', 'Koupé-Manengouba', 'Département du Koupé-Manengouba', 10, NOW()::text),
(28, 'LEB', 'Buea', 'Lebialem', 'Département du Lebialem', 10, NOW()::text),
(29, 'MAN', 'Mamfe', 'Manyu', 'Département du Manyu', 10, NOW()::text),
(30, 'MEM', 'Kumba', 'Meme', 'Département du Meme', 10, NOW()::text),
(31, 'NDI', 'Mundemba', 'Ndian', 'Département du Ndian', 10, NOW()::text);

-- Insert Candidates (7 major candidates for presidential election)
INSERT INTO candidat (code, noms_prenoms, photo, date_creation) VALUES
(1, 'Paul BIYA', '/images/candidates/biya.jpg', NOW()::text),
(2, 'Maurice KAMTO', '/images/candidates/kamto.jpg', NOW()::text),
(3, 'Joshua Osih NSAI', '/images/candidates/osih.jpg', NOW()::text),
(4, 'Akère MUNA', '/images/candidates/muna.jpg', NOW()::text),
(5, 'Adamou Ndam NJOYA', '/images/candidates/njoya.jpg', NOW()::text),
(6, 'Garga Haman ADJI', '/images/candidates/adji.jpg', NOW()::text),
(7, 'Serge Espoir MATOMBA', '/images/candidates/matomba.jpg', NOW()::text);

-- Insert Political Parties
INSERT INTO parti_politique (code, designation, abbreviation, description, coloration_bulletin, code_candidat, date_creation) VALUES
(1, 'Rassemblement Démocratique du Peuple Camerounais', 'RDPC', 'Parti au pouvoir depuis 1985', 'Vert', 1, NOW()::text),
(2, 'Mouvement pour la Renaissance du Cameroun', 'MRC', 'Principal parti d''opposition', 'Rouge', 2, NOW()::text),
(3, 'Social Democratic Front', 'SDF', 'Parti anglophone historique', 'Bleu', 3, NOW()::text),
(4, 'Alliance pour la Démocratie et le Développement', 'ADD', 'Coalition démocratique', 'Jaune', 4, NOW()::text),
(5, 'Union Démocratique du Cameroun', 'UDC', 'Parti centriste historique', 'Orange', 5, NOW()::text),
(6, 'Alliance Nationale pour la Démocratie et le Progrès', 'ANDP', 'Parti du Nord', 'Violet', 6, NOW()::text),
(7, 'Parti Camerounais pour la Réconciliation Nationale', 'PCRN', 'Nouveau parti politique', 'Rose', 7, NOW()::text);

-- Insert Roles
INSERT INTO role (code, libelle) VALUES
(1, 'Administrateur Système'),
(2, 'Superviseur National'),
(3, 'Responsable Régional'),
(4, 'Responsable Départemental'),
(5, 'Opérateur de Saisie'),
(6, 'Observateur');

-- Insert Users
INSERT INTO utilisateur (code, noms_prenoms, email, password, username, code_role, contact, adresse, statut_vie, date_creation) VALUES
(1, 'Jean-Claude MBALLA', 'admin@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'admin', 1, '+237690000001', 'Yaoundé', 1, NOW()::text),
(2, 'Marie NGONO EBANGA', 'supervisor@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'supervisor', 2, '+237690000002', 'Yaoundé', 1, NOW()::text),
(3, 'Paul ATANGANA', 'centre@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'centre_region', 3, '+237690000003', 'Yaoundé', 1, NOW()::text),
(4, 'François MENDOMO', 'mfoundi@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'mfoundi_dept', 4, '+237690000004', 'Yaoundé', 1, NOW()::text),
(5, 'Christine BELLA', 'wouri@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'wouri_dept', 4, '+237690000005', 'Douala', 1, NOW()::text),
(6, 'Pierre FOUDA', 'operator1@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'operator1', 5, '+237690000006', 'Yaoundé', 1, NOW()::text),
(7, 'Aminata IBRAHIM', 'adamaoua@elections.cm', '$2b$10$rW8t1QhQJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ', 'adamaoua_region', 3, '+237690000007', 'Ngaoundéré', 1, NOW()::text);

-- Insert Arrondissements (sample for major departments)
INSERT INTO arrondissement (code, code_departement, code_region, abbreviation, libelle, description, date_creation) VALUES
-- Mfoundi (Yaoundé)
(1, 5, 2, 'YDE1', 'Yaoundé 1er', 'Arrondissement de Yaoundé 1er', NOW()::text),
(2, 5, 2, 'YDE2', 'Yaoundé 2ème', 'Arrondissement de Yaoundé 2ème', NOW()::text),
(3, 5, 2, 'YDE3', 'Yaoundé 3ème', 'Arrondissement de Yaoundé 3ème', NOW()::text),
(4, 5, 2, 'YDE4', 'Yaoundé 4ème', 'Arrondissement de Yaoundé 4ème', NOW()::text),
(5, 5, 2, 'YDE5', 'Yaoundé 5ème', 'Arrondissement de Yaoundé 5ème', NOW()::text),
(6, 5, 2, 'YDE6', 'Yaoundé 6ème', 'Arrondissement de Yaoundé 6ème', NOW()::text),
(7, 5, 2, 'YDE7', 'Yaoundé 7ème', 'Arrondissement de Yaoundé 7ème', NOW()::text),

-- Wouri (Douala)
(8, 14, 5, 'DLA1', 'Douala 1er', 'Arrondissement de Douala 1er', NOW()::text),
(9, 14, 5, 'DLA2', 'Douala 2ème', 'Arrondissement de Douala 2ème', NOW()::text),
(10, 14, 5, 'DLA3', 'Douala 3ème', 'Arrondissement de Douala 3ème', NOW()::text),
(11, 14, 5, 'DLA4', 'Douala 4ème', 'Arrondissement de Douala 4ème', NOW()::text),
(12, 14, 5, 'DLA5', 'Douala 5ème', 'Arrondissement de Douala 5ème', NOW()::text),

-- Other major departments
(13, 26, 10, 'LMB', 'Limbe', 'Arrondissement de Limbe', NOW()::text),
(14, 23, 7, 'BMD', 'Bamenda', 'Arrondissement de Bamenda', NOW()::text),
(15, 17, 8, 'BFS', 'Bafoussam', 'Arrondissement de Bafoussam', NOW()::text);

-- Insert Bureau de Vote (sample voting stations)
INSERT INTO bureau_vote (code, designation, description, latitude, longitude, altititude, code_arrondissement, effectif, data_filled, date_creation) VALUES
-- Yaoundé bureaux
(1, 'École Publique de Mvog-Ada', 'Bureau de vote École Publique de Mvog-Ada', 3.8480, 11.5021, 750, 1, 850, 0, NOW()::text),
(2, 'École Publique de Nlongkak', 'Bureau de vote École Publique de Nlongkak', 3.8691, 11.5194, 760, 2, 920, 0, NOW()::text),
(3, 'Lycée de Biyem-Assi', 'Bureau de vote Lycée de Biyem-Assi', 3.8370, 11.5028, 740, 3, 1100, 0, NOW()::text),
(4, 'École Publique de Kondengui', 'Bureau de vote École Publique de Kondengui', 3.8123, 11.4789, 720, 4, 780, 0, NOW()::text),
(5, 'Collège Vogt', 'Bureau de vote Collège Vogt', 3.8634, 11.5211, 770, 5, 650, 0, NOW()::text),

-- Douala bureaux  
(6, 'École Publique de Bonapriso', 'Bureau de vote École Publique de Bonapriso', 4.0614, 9.7043, 20, 8, 890, 0, NOW()::text),
(7, 'École Publique de Deido', 'Bureau de vote École Publique de Deido', 4.0733, 9.7180, 15, 9, 750, 0, NOW()::text),
(8, 'Lycée de New-Bell', 'Bureau de vote Lycée de New-Bell', 4.0511, 9.6834, 25, 10, 1050, 0, NOW()::text),
(9, 'École Publique de Bonanjo', 'Bureau de vote École Publique de Bonanjo', 4.0489, 9.6957, 18, 11, 820, 0, NOW()::text),
(10, 'École Publique de Makepe', 'Bureau de vote École Publique de Makepe', 4.0342, 9.7456, 30, 12, 690, 0, NOW()::text);

-- Insert sample participation data for some departments
INSERT INTO participation_departement (
  code_departement, 
  nombre_bureau_vote, 
  nombre_inscrit, 
  nombre_votant,
  nombre_enveloppe_urnes, 
  bulletin_nul, 
  suffrage_exprime, 
  taux_participation,
  date_creation
) VALUES
(5, 125, 1850000, 1387500, 1387500, 92500, 1295000, 75.0, NOW()::text), -- Mfoundi
(14, 98, 1450000, 1015000, 1015000, 72500, 942500, 70.0, NOW()::text), -- Wouri  
(26, 67, 850000, 629750, 629750, 42500, 587250, 74.1, NOW()::text), -- Fako
(23, 89, 920000, 644000, 644000, 46000, 598000, 70.0, NOW()::text), -- Mezam
(17, 78, 780000, 569400, 569400, 39000, 530400, 73.0, NOW()::text); -- Hauts-Plateaux

-- Insert sample results data
INSERT INTO resultat_departement (code_departement, code_parti, nombre_vote, pourcentage, date_creation) VALUES
-- Mfoundi results
(5, 1, 648750, 50.1, NOW()::text), -- RDPC
(5, 2, 337350, 26.1, NOW()::text), -- MRC  
(5, 3, 142450, 11.0, NOW()::text), -- SDF
(5, 4, 90650, 7.0, NOW()::text),   -- ADD
(5, 5, 51750, 4.0, NOW()::text),   -- UDC
(5, 6, 12950, 1.0, NOW()::text),   -- ANDP
(5, 7, 11145, 0.8, NOW()::text),   -- PCRN

-- Wouri results
(14, 1, 424125, 45.0, NOW()::text), -- RDPC
(14, 2, 330875, 35.1, NOW()::text), -- MRC
(14, 3, 113100, 12.0, NOW()::text), -- SDF  
(14, 4, 47125, 5.0, NOW()::text),   -- ADD
(14, 5, 18850, 2.0, NOW()::text),   -- UDC
(14, 6, 4712, 0.5, NOW()::text),    -- ANDP
(14, 7, 3713, 0.4, NOW()::text);    -- PCRN

-- Insert user territorial assignments
INSERT INTO utilisateur_departement (code_utilisateur, code_departement) VALUES
(4, 5),  -- François assigned to Mfoundi
(5, 14); -- Christine assigned to Wouri

INSERT INTO utilisateur_region (code_utilisateur, code_region) VALUES
(3, 2), -- Paul assigned to Centre region
(7, 1); -- Aminata assigned to Adamaoua region

-- Insert some sample journal entries
INSERT INTO journal (code_utilisateur, action, description, timestamp, date_creation) VALUES
('4', 'DATA_ENTRY', 'Participation data submitted for Mfoundi department', NOW()::text, NOW()::text),
('5', 'DATA_ENTRY', 'Participation data submitted for Wouri department', NOW()::text, NOW()::text),
('3', 'VALIDATION', 'Data validation completed for Centre region', NOW()::text, NOW()::text),
('2', 'SUPERVISION', 'Daily supervision report generated', NOW()::text, NOW()::text);

-- Print completion message
SELECT 'Database seeding completed successfully! The following data has been inserted:' as message
UNION ALL SELECT '- 10 regions of Cameroon'
UNION ALL SELECT '- 31 major departments'  
UNION ALL SELECT '- 7 political candidates and parties'
UNION ALL SELECT '- 7 system users with different roles'
UNION ALL SELECT '- 15 arrondissements in major cities'
UNION ALL SELECT '- 10 sample voting bureaus'
UNION ALL SELECT '- Participation data for 5 departments'
UNION ALL SELECT '- Results data for 2 departments'
UNION ALL SELECT '- User territorial assignments'
UNION ALL SELECT '- Sample activity logs'
UNION ALL SELECT ''
UNION ALL SELECT 'You can now test the application with this data!';