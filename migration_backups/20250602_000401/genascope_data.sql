-- MySQL dump 10.13  Distrib 8.0.42, for Linux (aarch64)
--
-- Host: localhost    Database: genascope
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('acc-001','Test UniversityHospital001','testhospitalU.org',1,'2025-05-24 22:43:21','2025-06-01 22:15:37'),('acc-002','Medical Center','medcenter01`.org',0,'2025-05-24 22:43:21','2025-05-26 01:45:01'),('test-account-001','Test Hospital Sys','testhospital.com',1,'2025-05-29 07:31:58','2025-06-02 05:18:05');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('47934cf19141');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `clinician_id` varchar(36) NOT NULL,
  `date_time` datetime NOT NULL,
  `appointment_type` enum('virtual','in-person') NOT NULL,
  `status` enum('scheduled','completed','canceled','rescheduled') NOT NULL,
  `notes` text,
  `confirmation_code` varchar(10) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date` date NOT NULL,
  `time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_appointments_patient` (`patient_id`),
  KEY `idx_appointments_clinician` (`clinician_id`),
  KEY `idx_appointments_date` (`date_time`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `patient_id` varchar(36) DEFAULT NULL,
  `clinician_id` varchar(36) DEFAULT NULL,
  `session_type` varchar(32) DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `session_metadata` json DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clinician_availability`
--

DROP TABLE IF EXISTS `clinician_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinician_availability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clinician_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time_slot` varchar(5) NOT NULL,
  `available` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_clinician_availability_date` (`clinician_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clinician_availability`
--

LOCK TABLES `clinician_availability` WRITE;
/*!40000 ALTER TABLE `clinician_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `clinician_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eligibility_results`
--

DROP TABLE IF EXISTS `eligibility_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eligibility_results` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `result_data` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_eligibility_patient` (`patient_id`),
  CONSTRAINT `eligibility_results_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eligibility_results`
--

LOCK TABLES `eligibility_results` WRITE;
/*!40000 ALTER TABLE `eligibility_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `eligibility_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invites`
--

DROP TABLE IF EXISTS `invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invites` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `invite_token` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` varchar(36) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `clinician_id` varchar(36) DEFAULT NULL,
  `patient_id` varchar(36) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `custom_message` text,
  `session_metadata` json DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `accepted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_invites_invite_token` (`invite_token`),
  KEY `user_id` (`user_id`),
  KEY `clinician_id` (`clinician_id`),
  KEY `ix_invites_email` (`email`),
  KEY `fk_invites_patient_id` (`patient_id`),
  CONSTRAINT `invites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `invites_ibfk_2` FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invites`
--

LOCK TABLES `invites` WRITE;
/*!40000 ALTER TABLE `invites` DISABLE KEYS */;
INSERT INTO `invites` VALUES ('315351cb-fdf1-4d73-aee8-2fa96d5bda1f','mikeblok@test.com','78f715f8-5ee4-4eab-8ea1-e8215c9e867c','2025-05-31 08:44:15','2025-05-31 20:46:19',NULL,NULL,NULL,NULL,'test-clinician-1','9342509c-0839-43ce-a479-4875e95d884d','pending',NULL,NULL,'2025-06-14 20:46:19',NULL),('4c6fe038-4b9c-4c2b-8a40-07784d3d443b','patient2@test.com','bb48593d-72c5-46d5-9079-b6f9cf4bf2c4','2025-05-28 20:28:24','2025-05-28 20:28:24',NULL,NULL,NULL,NULL,'test-clinician-1','test-patient-2','pending','Welcome to Cancer-Genix!',NULL,'2025-06-11 20:28:24',NULL),('5e16d8bb-2f3d-4513-9d1c-9c978d9fffc8','joblo@test.com','9ada7feb-ff36-4f55-b01a-d3ca4da54c27','2025-05-31 08:21:32','2025-06-01 03:37:58',NULL,NULL,NULL,NULL,NULL,'8b7c77f5-ae64-431f-ae9b-a8ddacece454','pending',NULL,NULL,'2025-06-14 08:21:32',NULL),('7772df90-d070-4a20-a20b-c63332ef03bc','martialbb+000999@gmail.com','991caf58-5dfb-40c2-beb4-e021e1accce8','2025-05-26 20:24:30','2025-05-26 20:27:07',NULL,'Nick','Canon','5551234567','test-clinician-1',NULL,'accepted',NULL,NULL,'2025-06-09 20:24:30','2025-05-26 20:27:07'),('7fed879e-9ef3-45ed-8d43-ec45e1678365','janedo@test.com','f4ab94ac-1e82-4fa6-b486-6f21f94db0eb','2025-05-29 06:19:14','2025-05-29 06:19:14',NULL,NULL,NULL,NULL,'test-clinician-1','3b50f379-f3f5-4424-93d9-fb7760d7b342','pending',NULL,NULL,'2025-06-12 06:19:14',NULL),('a5a331e6-8a95-4c11-b694-9f0fa779a26f','martialbb@gmail.com','b522f26f-4a16-4fb6-8651-ef96ef315897','2025-05-26 08:26:52','2025-05-26 19:35:57',NULL,'Brian','Nelson','1112223333','test-clinician-1',NULL,'accepted',NULL,NULL,'2025-06-09 08:26:52','2025-05-26 19:35:57'),('b90f653c-c5af-4a24-838f-1ad059fa96e0','patient1@test.com','ae98db31-8e49-41a5-9d20-2e681e2e3f83','2025-05-28 20:28:10','2025-05-28 20:28:10',NULL,NULL,NULL,NULL,'test-clinician-1','test-patient-1','pending',NULL,NULL,'2025-06-11 20:28:10',NULL),('dac0eba5-cc82-4610-a57e-57956efae8f2','martialbb+abc1111@gmail.com','2fbdd2a4-dfe7-423c-993e-b606f97d2b5b','2025-05-26 06:47:12','2025-05-26 06:47:12',NULL,'Ricko','Polo','1112223333','test-superuser-1',NULL,'pending',NULL,NULL,'2025-06-09 06:47:12',NULL),('e39d42bc-fd5f-4f1e-bdb7-bce1ce648e2b','testpatient2@example.com','56bda748-2ff9-43c2-bf4d-827b23669480','2025-05-26 19:17:05','2025-05-26 19:17:05',NULL,'Test2','Patient2','987-654-3210','test-clinician-1',NULL,'pending',NULL,NULL,'2025-06-09 19:17:05',NULL),('f91129db-5406-4246-9600-888536961bfc','testpatient@example.com','13b0812d-c30b-4ea6-843b-e5a26473d7d8','2025-05-26 19:14:06','2025-05-26 19:14:06',NULL,'Test','Patient','123-456-7890','test-clinician-1',NULL,'pending',NULL,NULL,'2025-06-09 19:14:05',NULL);
/*!40000 ALTER TABLE `invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_integrations`
--

DROP TABLE IF EXISTS `lab_integrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_integrations` (
  `id` varchar(36) NOT NULL,
  `lab_name` varchar(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `api_url` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `settings` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_integrations`
--

LOCK TABLES `lab_integrations` WRITE;
/*!40000 ALTER TABLE `lab_integrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_integrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_orders`
--

DROP TABLE IF EXISTS `lab_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_orders` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `clinician_id` varchar(36) NOT NULL,
  `lab_id` varchar(36) DEFAULT NULL,
  `external_order_id` varchar(255) DEFAULT NULL,
  `order_number` varchar(32) NOT NULL,
  `test_type` varchar(100) NOT NULL,
  `status` varchar(32) NOT NULL,
  `requisition_details` json DEFAULT NULL,
  `notes` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `collection_date` datetime DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_lab_orders_patient` (`patient_id`),
  KEY `idx_lab_orders_clinician` (`clinician_id`),
  KEY `idx_lab_orders_lab` (`lab_id`),
  CONSTRAINT `lab_orders_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_orders_ibfk_2` FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_orders_ibfk_3` FOREIGN KEY (`lab_id`) REFERENCES `lab_integrations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_orders`
--

LOCK TABLES `lab_orders` WRITE;
/*!40000 ALTER TABLE `lab_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_results`
--

DROP TABLE IF EXISTS `lab_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_results` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `result_status` varchar(32) NOT NULL,
  `result_data` json DEFAULT NULL,
  `report_url` varchar(255) DEFAULT NULL,
  `summary` text,
  `abnormal` tinyint(1) NOT NULL DEFAULT '0',
  `reviewed` tinyint(1) NOT NULL DEFAULT '0',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lab_results_reviewer` (`reviewed_by`),
  KEY `idx_lab_results_order` (`order_id`),
  CONSTRAINT `lab_results_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `lab_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_results_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `lab_orders` (`id`),
  CONSTRAINT `lab_results_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_results`
--

LOCK TABLES `lab_results` WRITE;
/*!40000 ALTER TABLE `lab_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_profiles`
--

DROP TABLE IF EXISTS `patient_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `medical_history` varchar(2000) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `ix_patient_profiles_user_id` (`user_id`),
  CONSTRAINT `patient_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_profiles`
--

LOCK TABLES `patient_profiles` WRITE;
/*!40000 ALTER TABLE `patient_profiles` DISABLE KEYS */;
INSERT INTO `patient_profiles` VALUES ('81fe5919-5530-4bfa-91e8-443d9ff5a666','e397aa8c-8758-4c10-b572-c6dd1603549c','1980-01-01 00:00:00',NULL,'1112223333',NULL,NULL,'2025-05-26 19:35:57','2025-05-26 19:35:57');
/*!40000 ALTER TABLE `patient_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `external_id` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `notes` text,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `clinician_id` varchar(36) DEFAULT NULL,
  `account_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_patients_email` (`email`),
  KEY `idx_patients_external_id` (`external_id`),
  KEY `idx_patients_clinician_id` (`clinician_id`),
  KEY `idx_patients_account_id` (`account_id`),
  KEY `idx_patients_user_id` (`user_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patients_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES ('3b50f379-f3f5-4424-93d9-fb7760d7b342','janedo@test.com','Janepopp','Doe','1112223333',NULL,'1990-01-01',NULL,'active','2025-05-28 19:57:41','2025-05-29 06:58:31','test-clinician-1',NULL,NULL),('8b7c77f5-ae64-431f-ae9b-a8ddacece454','joblo@test.com','Jo','Bloward','1112223334',NULL,'1990-01-01',NULL,'active','2025-05-31 08:20:43','2025-06-01 03:37:58',NULL,NULL,NULL),('9342509c-0839-43ce-a479-4875e95d884d','mikeblok@test.com','Michael ','Bloom','2232223333',NULL,'1990-01-01',NULL,'active','2025-05-31 08:44:01','2025-05-31 08:44:01','clinician-002',NULL,NULL),('test-patient-1','patient1@test.com','Alice','Johnson','+1-555-0101',NULL,NULL,NULL,'active','2025-05-28 19:03:22','2025-05-28 19:03:22','test-clinician-1','acc-001',NULL),('test-patient-2','patient2@test.com','Bob','Smith','+1-555-0102',NULL,NULL,NULL,'active','2025-05-28 19:03:22','2025-05-28 19:03:22','test-clinician-1','acc-001',NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurring_availability`
--

DROP TABLE IF EXISTS `recurring_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_availability` (
  `id` varchar(36) NOT NULL,
  `clinician_id` varchar(36) DEFAULT NULL,
  `day_of_week` int NOT NULL,
  `time` time NOT NULL,
  `start_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `days_of_week` text,
  `time_slots` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurring_availability`
--

LOCK TABLES `recurring_availability` WRITE;
/*!40000 ALTER TABLE `recurring_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `recurring_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_assessments`
--

DROP TABLE IF EXISTS `risk_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_assessments` (
  `id` varchar(36) NOT NULL,
  `patient_id` varchar(36) NOT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  `is_eligible` tinyint(1) DEFAULT NULL,
  `nccn_eligible` tinyint(1) DEFAULT NULL,
  `tyrer_cuzick_score` float DEFAULT NULL,
  `tyrer_cuzick_threshold` float DEFAULT NULL,
  `risk_factors` json DEFAULT NULL,
  `recommendations` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_assessments`
--

LOCK TABLES `risk_assessments` WRITE;
/*!40000 ALTER TABLE `risk_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `risk_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email` varchar(255) NOT NULL,
  `hashed_password` varchar(255) DEFAULT NULL,
  `account_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `clinician_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('046acfc3-b05a-4bfa-a8a7-9c6d7049612d','Test User','PATIENT','2025-05-22 05:32:50','2025-05-22 05:32:50','user_046acfc3-b05a-4bfa-a8a7-9c6d7049612d@example.com','$2b$12$OZbQVmWIbHt409TvzZH1ZeY4s4Fr3ZYvT4f3KMXYG4jWH3SgR42s6',NULL,1,NULL),('30b1d13d-40d1-4b49-9a1e-2b7e6aca2bbb','Test User','PATIENT','2025-05-22 05:34:00','2025-05-22 05:34:00','user_30b1d13d-40d1-4b49-9a1e-2b7e6aca2bbb@example.com','$2b$12$DaMAMUfXYh6g0G9Pi7EmRuX5Z3uF9SJUEfwzZ9gHTp5TQdbrPIayW',NULL,1,NULL),('5dafa622-9c39-474d-ac57-edfb2a8abb8c','Janepp Doe','SUPER_ADMIN','2025-05-25 21:16:20','2025-05-26 01:09:56','janetest01@test.com','$2b$12$IOOGAZSg5m6pCp2OoNMWQeBC6XDtf0xi29KO1itOwRgy722piFOSm','account_abc',1,NULL),('admin-001','Admin User','ADMIN','2025-05-29 07:31:58','2025-06-02 05:13:12','admin@testhospital.com','$2b$12$hSkarWJ3NsXZVuQwtgYmi.EJZiErAzZeyBFMSAsppX.Uwe571L9DW','test-account-001',1,NULL),('c6034faf-2240-441f-9253-1c86aef849c8','Test User','PATIENT','2025-05-22 05:31:16','2025-05-22 05:31:16','user_c6034faf-2240-441f-9253-1c86aef849c8@example.com','$2b$12$KQz7iGlci4pRhaqS.C1tTOP1wqVtuDl.pNt45/XNelimSz5ebcKhC',NULL,1,NULL),('clinician-001','Dr. Jane Smith FINAL TEST','CLINICIAN','2025-06-01 03:41:15','2025-06-01 03:54:05','clinician@testhospital.com','$2b$12$pRxQUBZ6BeaZVuKzzpXlyOcTTVB8qB1LGN1UTfA.HY6QmLfYGLDIK','test-account-001',1,NULL),('clinician-002','Dr. John Davis','CLINICIAN','2025-05-29 07:31:59','2025-05-29 07:31:59','clinician2@testhospital.com','$2b$12$qafGsIxKEc4MXHKRHYD2c.T4EKHP3F1jpS8MYA28QYio4fOQEgfhi','test-account-001',1,NULL),('d9d4b899-6608-4c81-8063-caa06087b453','Test2 Patient2','PATIENT','2025-05-26 19:27:12','2025-05-26 19:27:12','testpatient2@example.com','$2b$12$4xUVjVgBWIq/1ol7CD2L0uGypuQctuzZj2jZmG12LfSeT8qO4Zoam',NULL,1,'test-clinician-1'),('db122dda-d9f2-4feb-8235-154d86531ec3','Test User','PATIENT','2025-05-22 05:28:17','2025-05-22 05:28:17','user_db122dda-d9f2-4feb-8235-154d86531ec3@example.com','$2b$12$kIVWgVxeqx1k/AVJucPWNupsHPFDwh5xPs4xP/Pu/fJJmq4CsMCgy',NULL,1,NULL),('e397aa8c-8758-4c10-b572-c6dd1603549c','Brian Nelson','PATIENT','2025-05-26 19:35:57','2025-05-26 19:35:57','martialbb@gmail.com','$2b$12$ju.yT/c6bT/0xO1w4im7A.xV0Z3cS/8z3CI17Uj7beydXC95bh0jO',NULL,1,'test-clinician-1'),('labtech-001','Lab Tech User','LAB_TECH','2025-05-29 07:31:59','2025-05-29 07:31:59','labtech@testhospital.com','$2b$12$3OJTTDYtMRvh/gUgG8A7sujZnKvz4JA.aDQ64lHIdeuwpOssiyH5m','test-account-001',1,NULL),('patient-001','John Doe','PATIENT','2025-05-29 07:31:59','2025-06-01 03:37:58','patient1@example.com','$2b$12$AiEQ8sJMCSqOwaiHTpN.4O4O46iI36NUfjwuBopmy79XXCW6L/rte','test-account-001',1,NULL),('super-admin-001','Super Admin User','SUPER_ADMIN','2025-05-29 07:31:58','2025-05-29 07:31:58','superadmin@genascope.com','$2b$12$TJANOGQCeto3ICLpfTWQy.KpqccLVyyvcIQfWqzC2oTkzDn6ipwgq',NULL,1,NULL),('test-admin-1','Test Admin Utah','ADMIN','2025-05-23 06:56:48','2025-06-02 05:17:35','admin@test.com','$2b$12$fg7dXzr5B4xJfFbjLXdCfea7Uwet83h2kPGWSc9Aip/PeBaktgG8G','test-account-001',1,NULL),('test-clinician-1','Dr. Test Clinician','CLINICIAN','2025-05-23 06:56:48','2025-05-23 06:56:48','clinician@test.com','$2b$12$QjUyhpIh0PKVALn8Rf6j7e5p0Nu1bVxIuyKP9qFCmsP10HMmEQeA.',NULL,1,NULL),('test-labtech-1','Test Lab Technician','LAB_TECH','2025-05-23 06:56:49','2025-05-23 06:56:49','labtech@test.com','$2b$12$06lqTupwQjKza6agnXKp2OdBImIQB8/J1kCjDGx0VGRqkXbS58tXi',NULL,1,NULL),('test-patient-1','Test Patient','PATIENT','2025-05-23 06:56:49','2025-05-23 06:56:49','patient@test.com','$2b$12$/7Vvu58rtfqFnd5/f9YgMeBwwQ.DbXFguDFVlK0NrZ.1KA9kQnEPq',NULL,1,'test-clinician-1'),('test-superuser-1','Test Superuser','SUPER_ADMIN','2025-05-23 06:56:48','2025-05-23 06:56:48','superuser@test.com','$2b$12$aZ8Z0XCkPuUfIfd1YkxIbu16UxyLWwI6iUODCIs31IlnjaX.fiIBq',NULL,1,NULL),('user-id','Test User','PATIENT','2025-05-22 05:25:50','2025-05-22 05:25:50','user@example.com','$2b$12$JtQZBEMvkqQ3i2MxUmjQ0uYQV/XPEyXJabO825vqASw/cITwrn97m',NULL,1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'genascope'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-02  6:04:02
