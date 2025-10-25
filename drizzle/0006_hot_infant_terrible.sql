CREATE TABLE `contractor_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`contractor_id` int NOT NULL,
	`user_id` int NOT NULL,
	`work_description` text NOT NULL,
	`quote_amount` int NOT NULL,
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`valid_until` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractor_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` varchar(255),
	`specialty` varchar(100),
	`phone` varchar(20),
	`email` varchar(320),
	`rating` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`user_id` int NOT NULL,
	`offer_amount` int NOT NULL,
	`status` enum('draft','submitted','accepted','rejected','countered','withdrawn') NOT NULL DEFAULT 'draft',
	`contingencies` text,
	`closing_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`task_type` enum('inspection','appraisal','contractor_quote','financing','title_search','insurance','walkthrough','closing','other') NOT NULL,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`due_date` timestamp,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
