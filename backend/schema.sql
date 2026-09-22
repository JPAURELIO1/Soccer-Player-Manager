-- Soccer Player Manager — database schema
--
-- How to use on Freehostia:
--   1. cPanel > MySQL Databases: create a database and a user, and grant the
--      user ALL PRIVILEGES on that database.
--   2. cPanel > phpMyAdmin: select the new database, open the "Import" tab,
--      choose this file, and click Go.
--   3. Copy the database name / user / password into config.php.
--
-- Do NOT include a CREATE DATABASE statement: on shared hosting the database
-- is created for you through cPanel and the name is prefixed automatically.

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `players`;

CREATE TABLE `players` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `full_name`      VARCHAR(100)  NOT NULL,
  `age`            TINYINT UNSIGNED NOT NULL,
  `jersey_number`  TINYINT UNSIGNED NOT NULL,
  `nationality`    VARCHAR(60)   NOT NULL,
  `team`           VARCHAR(80)   NOT NULL,
  `position`       ENUM('Forward','Midfielder','Defender','Goalkeeper') NOT NULL,
  `preferred_foot` ENUM('Left','Right','Both') NOT NULL,
  `height`         DECIMAL(3,2)  NOT NULL COMMENT 'metres, e.g. 1.70',
  -- Base64 image data. LONGTEXT because a data URI easily exceeds TEXT's 64KB.
  `photo`          LONGTEXT      NULL,
  `description`    TEXT          NOT NULL,
  `created_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_full_name` (`full_name`),
  KEY `idx_team` (`team`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample squad so the app has something to show on first run.
INSERT INTO `players`
  (`full_name`, `age`, `jersey_number`, `nationality`, `team`, `position`, `preferred_foot`, `height`, `description`)
VALUES
  ('Lionel Messi', 39, 10, 'Argentina', 'Inter Miami', 'Forward', 'Left', 1.70,
   'Left-footed playmaker known for close control, vision and free kicks. Wears the number 10 and drops deep to create chances for the front line.'),

  ('Cristiano Ronaldo', 41, 7, 'Portugal', 'Al Nassr', 'Forward', 'Right', 1.87,
   'Powerful centre forward with exceptional aerial ability and a long-range shot. Consistently one of the highest scorers in every league he has played in.'),

  ('Kevin De Bruyne', 35, 17, 'Belgium', 'Napoli', 'Midfielder', 'Right', 1.81,
   'Deep-lying creator with elite passing range. Specialises in whipped crosses and through balls from the right half-space.'),

  ('Virgil van Dijk', 35, 4, 'Netherlands', 'Liverpool', 'Defender', 'Right', 1.93,
   'Commanding centre back who reads the game early and rarely needs to slide in. Strong in the air at both ends of the pitch.'),

  ('Alisson Becker', 33, 1, 'Brazil', 'Liverpool', 'Goalkeeper', 'Right', 1.91,
   'Sweeper keeper comfortable playing out from the back. Quick off his line and reliable in one-on-one situations.');
