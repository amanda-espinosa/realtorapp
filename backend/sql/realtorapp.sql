/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: realtorapp
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `realtorapp`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `realtorapp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `realtorapp`;

--
-- Table structure for table `properties_list`
--

DROP TABLE IF EXISTS `properties_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties_list` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `price` float unsigned DEFAULT 0,
  `number_of_rooms` tinyint(3) unsigned DEFAULT 0,
  `number_of_bathrooms` float unsigned DEFAULT 0,
  `area_sqft` float unsigned DEFAULT 0,
  `property_state` tinyint(3) unsigned NOT NULL,
  `address_street` varchar(50) DEFAULT '',
  `address_apartment` varchar(10) DEFAULT '',
  `address_city` varchar(50) DEFAULT '',
  `address_state` varchar(50) DEFAULT '',
  `address_zip` mediumint(8) unsigned DEFAULT 0,
  `description` text NOT NULL,
  `heating_type` varchar(50) DEFAULT NULL,
  `cooling_type` varchar(50) DEFAULT NULL,
  `appliances` text DEFAULT NULL,
  `flooring_type` varchar(50) DEFAULT NULL,
  `basement` tinyint(1) DEFAULT 0,
  `fireplace` tinyint(1) DEFAULT 0,
  `levels` int(11) NOT NULL,
  `parcel_number` varchar(100) NOT NULL,
  `special_conditions` text DEFAULT NULL,
  `size_lot` decimal(10,2) DEFAULT NULL,
  `price_per_squarefeet` decimal(10,2) DEFAULT NULL,
  `built_in_year` year(4) DEFAULT NULL,
  `home_type` varchar(50) NOT NULL,
  `materials` text DEFAULT NULL,
  `sewer_type` varchar(50) DEFAULT NULL,
  `water_type` varchar(50) DEFAULT NULL,
  `hoa_cost` decimal(10,2) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `enrollment_datetime_backup` datetime DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-14 18:41:24
