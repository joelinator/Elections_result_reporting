/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80300
 Source Host           : localhost:3306
 Source Schema         : election

 Target Server Type    : MySQL
 Target Server Version : 80300
 File Encoding         : 65001

 Date: 15/09/2025 14:54:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for arrondissement
-- ----------------------------
DROP TABLE IF EXISTS `arrondissement`;
CREATE TABLE `arrondissement`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_departement` int(0) NULL DEFAULT NULL,
  `code_region` int(0) NULL DEFAULT NULL,
  `abbreviation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `libelle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 475 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for bureau_vote
-- ----------------------------
DROP TABLE IF EXISTS `bureau_vote`;
CREATE TABLE `bureau_vote`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `latitude` decimal(19, 4) NULL DEFAULT NULL,
  `longitude` decimal(19, 4) NULL DEFAULT NULL,
  `altititude` decimal(19, 4) NULL DEFAULT NULL,
  `data_filled` int(0) NULL DEFAULT 0,
  `code_arrondissement` int(0) NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `data_incoherent` int(0) NULL DEFAULT NULL,
  `effectif` bigint(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 31664 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for candidat
-- ----------------------------
DROP TABLE IF EXISTS `candidat`;
CREATE TABLE `candidat`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `noms_prenoms` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for departement
-- ----------------------------
DROP TABLE IF EXISTS `departement`;
CREATE TABLE `departement`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `abbreviation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `chef_lieu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `libelle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_region` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 59 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for journal
-- ----------------------------
DROP TABLE IF EXISTS `journal`;
CREATE TABLE `journal`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_utilisateur` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `timestamp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 142 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for parti_politique
-- ----------------------------
DROP TABLE IF EXISTS `parti_politique`;
CREATE TABLE `parti_politique`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `designation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `abbreviation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `coloration_bulletin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_candidat` int(0) NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for participation
-- ----------------------------
DROP TABLE IF EXISTS `participation`;
CREATE TABLE `participation`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_bureau_vote` int(0) NULL DEFAULT NULL,
  `nombre_inscrit` int(0) NULL DEFAULT NULL,
  `nombre_votant` int(0) NULL DEFAULT NULL,
  `bulletin_nul` int(0) NULL DEFAULT NULL,
  `suffrage_exprime` decimal(19, 4) NULL DEFAULT NULL,
  `taux_participation` decimal(19, 4) NULL DEFAULT NULL,
  `code_createur` int(0) NULL DEFAULT NULL,
  `code_modificateur` int(0) NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `statut_validation` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for permission
-- ----------------------------
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission`  (
  `code` int(0) NOT NULL,
  `nom_permission` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `code_createur` int(0) NULL DEFAULT NULL,
  `code_modificateur` int(0) NULL DEFAULT NULL,
  `date_modification` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for proces_verbaux
-- ----------------------------
DROP TABLE IF EXISTS `proces_verbaux`;
CREATE TABLE `proces_verbaux`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_bureau_vote` int(0) NULL DEFAULT NULL,
  `url_pv` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `hash_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `timestamp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for region
-- ----------------------------
DROP TABLE IF EXISTS `region`;
CREATE TABLE `region`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `abbreviation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `libelle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `chef_lieu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for resultat
-- ----------------------------
DROP TABLE IF EXISTS `resultat`;
CREATE TABLE `resultat`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_bureau` int(0) NULL DEFAULT NULL,
  `code_parti_politique` int(0) NULL DEFAULT NULL,
  `nombre_vote` int(0) NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `statut_validation` int(0) NULL DEFAULT NULL,
  `code_participation` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 97 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for role_permission
-- ----------------------------
DROP TABLE IF EXISTS `role_permission`;
CREATE TABLE `role_permission`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_permission` int(0) NULL DEFAULT NULL,
  `code_role` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Table structure for synthese_arrondissement
-- ----------------------------
DROP TABLE IF EXISTS `synthese_arrondissement`;
CREATE TABLE `synthese_arrondissement`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_arrondissement` int(0) NOT NULL,
  `code_parti` int(0) NOT NULL,
  `nombre_vote` int(0) NULL DEFAULT 0,
  `nombre_inscrit` int(0) NULL DEFAULT 0,
  `nombre_votant` int(0) NULL DEFAULT 0,
  `bulletin_nul` int(0) NULL DEFAULT 0,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  UNIQUE INDEX `uk_arrond_parti`(`code_arrondissement`, `code_parti`) USING BTREE,
  INDEX `idx_code_arrondissement`(`code_arrondissement`) USING BTREE,
  INDEX `idx_code_parti`(`code_parti`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 4333 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for synthese_bureau_vote
-- ----------------------------
DROP TABLE IF EXISTS `synthese_bureau_vote`;
CREATE TABLE `synthese_bureau_vote`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_bureau_vote` int(0) NOT NULL,
  `code_parti` int(0) NOT NULL,
  `nombre_vote` int(0) NULL DEFAULT 0,
  `nombre_inscrit` int(0) NULL DEFAULT 0,
  `nombre_votant` int(0) NULL DEFAULT 0,
  `bulletin_nul` int(0) NULL DEFAULT 0,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  UNIQUE INDEX `uk_arrond_parti`(`code_bureau_vote`, `code_parti`) USING BTREE,
  INDEX `idx_code_arrondissement`(`code_bureau_vote`) USING BTREE,
  INDEX `idx_code_parti`(`code_parti`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 997 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for synthese_departement
-- ----------------------------
DROP TABLE IF EXISTS `synthese_departement`;
CREATE TABLE `synthese_departement`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_departement` int(0) NOT NULL,
  `code_parti` int(0) NOT NULL,
  `nombre_vote` int(0) NULL DEFAULT 0,
  `nombre_inscrit` int(0) NULL DEFAULT 0,
  `nombre_votant` int(0) NULL DEFAULT 0,
  `bulletin_nul` int(0) NULL DEFAULT 0,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  UNIQUE INDEX `uk_dept_parti`(`code_departement`, `code_parti`) USING BTREE,
  INDEX `idx_code_departement`(`code_departement`) USING BTREE,
  INDEX `idx_code_parti`(`code_parti`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 697 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for synthese_regionale
-- ----------------------------
DROP TABLE IF EXISTS `synthese_regionale`;
CREATE TABLE `synthese_regionale`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_region` int(0) NOT NULL,
  `code_parti` int(0) NOT NULL,
  `nombre_vote` int(0) NULL DEFAULT 0,
  `nombre_inscrit` int(0) NULL DEFAULT 0,
  `nombre_votant` int(0) NULL DEFAULT 0,
  `bulletin_nul` int(0) NULL DEFAULT 0,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  UNIQUE INDEX `uk_region_parti`(`code_region`, `code_parti`) USING BTREE,
  INDEX `idx_code_region`(`code_region`) USING BTREE,
  INDEX `idx_code_parti`(`code_parti`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 121 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for temp_resultats_mobile
-- ----------------------------
DROP TABLE IF EXISTS `temp_resultats_mobile`;
CREATE TABLE `temp_resultats_mobile`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_utilisateur` int(0) NULL DEFAULT NULL,
  `code_bureau_vote` int(0) NULL DEFAULT NULL,
  `donnees_locale` varchar(10000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `statut_synchronisation` int(0) NULL DEFAULT NULL,
  `date_locale` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_createur` int(0) NULL DEFAULT NULL,
  `code_modificateur` int(0) NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for utilisateur
-- ----------------------------
DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE `utilisateur`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `noms_prenoms` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `last_login` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `boite_postale` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `adresse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_role` int(0) NULL DEFAULT NULL,
  `code_createur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `code_modificateur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_creation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_modification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `statut_vie` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE,
  UNIQUE INDEX `IDX_44f7db41561d2c5fb68e8669a8`(`username`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for utilisateur_affectation_territoriale
-- ----------------------------
DROP TABLE IF EXISTS `utilisateur_affectation_territoriale`;
CREATE TABLE `utilisateur_affectation_territoriale`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_utilisateur` int(0) NOT NULL,
  `type_territorial` enum('region','departement','arrondissement') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code_territorial` int(0) NOT NULL,
  `affecte_par` int(0) NULL DEFAULT NULL,
  `date_affectation` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `date_modification` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  `est_actif` tinyint(1) NULL DEFAULT 1,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`code`) USING BTREE,
  UNIQUE INDEX `affectation_unique`(`code_utilisateur`, `type_territorial`, `code_territorial`, `est_actif`) USING BTREE,
  INDEX `idx_utilisateur_territoires`(`code_utilisateur`, `est_actif`) USING BTREE,
  INDEX `idx_recherche_territoriale`(`type_territorial`, `code_territorial`) USING BTREE,
  INDEX `idx_affecte_par`(`affecte_par`) USING BTREE,
  INDEX `idx_date_affectation`(`date_affectation`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for utilisateur_arrondissement
-- ----------------------------
DROP TABLE IF EXISTS `utilisateur_arrondissement`;
CREATE TABLE `utilisateur_arrondissement`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_arrondissement` int(0) NULL DEFAULT NULL,
  `code_utilisateur` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Table structure for utilisateur_bureau_vote
-- ----------------------------
DROP TABLE IF EXISTS `utilisateur_bureau_vote`;
CREATE TABLE `utilisateur_bureau_vote`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_bureau_vote` int(0) NULL DEFAULT NULL,
  `code_utilisateur` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Table structure for utilisateur_departement
-- ----------------------------
DROP TABLE IF EXISTS `utilisateur_departement`;
CREATE TABLE `utilisateur_departement`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_departement` int(0) NULL DEFAULT NULL,
  `code_utilisateur` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- Table structure for utilisateur_region
-- ----------------------------
DROP TABLE IF EXISTS `utilisateur_region`;
CREATE TABLE `utilisateur_region`  (
  `code` int(0) NOT NULL AUTO_INCREMENT,
  `code_region` int(0) NULL DEFAULT NULL,
  `code_utilisateur` int(0) NULL DEFAULT NULL,
  PRIMARY KEY (`code`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Fixed;

-- ----------------------------
-- View structure for v_administrative_structure
-- ----------------------------
DROP VIEW IF EXISTS `v_administrative_structure`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_administrative_structure` AS select `r`.`code` AS `code_region`,`r`.`code` AS `region_code`,`r`.`libelle` AS `region_name`,`r`.`chef_lieu` AS `region_chef_lieu`,`d`.`code` AS `code_departement`,`d`.`code` AS `department_code`,`d`.`libelle` AS `department_name`,`d`.`chef_lieu` AS `department_chef_lieu`,`a`.`code` AS `code_arrondissement`,`a`.`code` AS `arrondissement_code`,`a`.`libelle` AS `arrondissement_name` from ((`region` `r` left join `departement` `d` on((`r`.`code` = `d`.`code_region`))) left join `arrondissement` `a` on((`d`.`code` = `a`.`code_departement`))) order by `r`.`libelle`,`d`.`libelle`,`a`.`libelle`;

-- ----------------------------
-- Procedure structure for AffecterTerritoireUtilisateur
-- ----------------------------
DROP PROCEDURE IF EXISTS `AffecterTerritoireUtilisateur`;
delimiter ;;
CREATE PROCEDURE `AffecterTerritoireUtilisateur`(IN p_code_utilisateur INT,
    IN p_type_territorial VARCHAR(20),
    IN p_code_territorial INT,
    IN p_affecte_par INT,
    IN p_notes TEXT)
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
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for AggregateAllResults
-- ----------------------------
DROP PROCEDURE IF EXISTS `AggregateAllResults`;
delimiter ;;
CREATE PROCEDURE `AggregateAllResults`()
BEGIN
    CALL AggregateArrondissementResults();
    CALL AggregateDepartementResults();
    CALL AggregateRegionalResults();
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for AggregateArrondissementResults
-- ----------------------------
DROP PROCEDURE IF EXISTS `AggregateArrondissementResults`;
delimiter ;;
CREATE PROCEDURE `AggregateArrondissementResults`()
BEGIN
    DELETE FROM synthese_arrondissement;

    INSERT INTO synthese_arrondissement (
        code_arrondissement, 
        code_parti, 
        nombre_vote, 
        nombre_inscrit, 
        nombre_votant, 
        bulletin_nul,
        date_creation
    )
    SELECT 
        arr.code AS code_arrondissement,
        pp.code AS code_parti,
        COALESCE(SUM(r.nombre_vote), 0) AS total_votes,
        COALESCE(SUM(p.nombre_inscrit), 0) AS total_inscrit,
        COALESCE(SUM(p.nombre_votant), 0) AS total_votant,
        COALESCE(SUM(p.bulletin_nul), 0) AS total_nul,
        NOW()
    FROM arrondissement arr
    CROSS JOIN parti_politique pp
    LEFT JOIN bureau_vote bv 
        ON bv.code_arrondissement = arr.code
    LEFT JOIN resultat r 
        ON r.code_bureau = bv.code 
       AND r.code_parti_politique = pp.code
       AND r.statut_validation = 1
    LEFT JOIN participation p 
        ON p.code_bureau_vote = bv.code
    GROUP BY arr.code, pp.code;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for AggregateDepartementResults
-- ----------------------------
DROP PROCEDURE IF EXISTS `AggregateDepartementResults`;
delimiter ;;
CREATE PROCEDURE `AggregateDepartementResults`()
BEGIN
    DELETE FROM synthese_departement;
    
    INSERT INTO synthese_departement (
        code_departement, 
        code_parti, 
        nombre_vote, 
        nombre_inscrit, 
        nombre_votant, 
        bulletin_nul,
        date_creation
    )
    SELECT 
        a.code_departement,
        sa.code_parti,
        SUM(sa.nombre_vote) as total_votes,
        SUM(sa.nombre_inscrit) as total_inscrit,
        SUM(sa.nombre_votant) as total_votant,
        SUM(sa.bulletin_nul) as total_nul,
        NOW()
    FROM synthese_arrondissement sa
    INNER JOIN arrondissement a ON sa.code_arrondissement = a.code
    GROUP BY a.code_departement, sa.code_parti;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for AggregateRegionalResults
-- ----------------------------
DROP PROCEDURE IF EXISTS `AggregateRegionalResults`;
delimiter ;;
CREATE PROCEDURE `AggregateRegionalResults`()
BEGIN
    DELETE FROM synthese_regionale;
    
    INSERT INTO synthese_regionale (
        code_region, 
        code_parti, 
        nombre_vote, 
        nombre_inscrit, 
        nombre_votant, 
        bulletin_nul,
        date_creation
    )
    SELECT 
        d.code_region,
        sd.code_parti,
        SUM(sd.nombre_vote) as total_votes,
        SUM(sd.nombre_inscrit) as total_inscrit,
        SUM(sd.nombre_votant) as total_votant,
        SUM(sd.bulletin_nul) as total_nul,
        NOW()
    FROM synthese_departement sd
    INNER JOIN departement d ON sd.code_departement = d.code
    GROUP BY d.code_region, sd.code_parti;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for initialiser_synthese_bureau_vote
-- ----------------------------
DROP PROCEDURE IF EXISTS `initialiser_synthese_bureau_vote`;
delimiter ;;
CREATE PROCEDURE `initialiser_synthese_bureau_vote`()
BEGIN
    -- Vider la table
    TRUNCATE TABLE synthese_bureau_vote;

    -- Insérer les données
    INSERT INTO synthese_bureau_vote (
        code_bureau_vote,
        code_parti,
        nombre_vote,
        nombre_inscrit,
        nombre_votant,
        bulletin_nul,
        code_createur,
        date_creation
    )
    SELECT 
        bv.code AS code_bureau_vote,
        pp.code AS code_parti,
        IFNULL(r.nombre_vote, 0) AS nombre_vote,
        IFNULL(p.nombre_inscrit, 0) AS nombre_inscrit,
        IFNULL(p.nombre_votant, 0) AS nombre_votant,
        IFNULL(p.bulletin_nul, 0) AS bulletin_nul,
        'system' AS code_createur,
        NOW() AS date_creation
    FROM 
        bureau_vote bv
    CROSS JOIN 
        parti_politique pp
    LEFT JOIN 
        resultat r
    ON r.code_bureau = bv.code
       AND r.code_parti_politique = pp.code
    LEFT JOIN
        participation p
    ON p.code_bureau_vote = bv.code;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for SupprimerTerritoireUtilisateur
-- ----------------------------
DROP PROCEDURE IF EXISTS `SupprimerTerritoireUtilisateur`;
delimiter ;;
CREATE PROCEDURE `SupprimerTerritoireUtilisateur`(IN p_code_utilisateur INT,
    IN p_type_territorial VARCHAR(20), 
    IN p_code_territorial INT)
BEGIN
    UPDATE utilisateur_affectation_territoriale 
    SET est_actif = 0, date_modification = NOW()
    WHERE code_utilisateur = p_code_utilisateur 
      AND type_territorial = p_type_territorial 
      AND code_territorial = p_code_territorial 
      AND est_actif = 1;
    
    SELECT 'Territoire supprimé avec succès!' as resultat;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
