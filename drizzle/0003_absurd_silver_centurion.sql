CREATE TABLE `property_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`userId` int NOT NULL,
	`noteText` text NOT NULL,
	`noteType` enum('general','inspection','contractor','financing','offer') NOT NULL DEFAULT 'general',
	`isPrivate` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`sharedByUserId` int NOT NULL,
	`sharedWithEmail` varchar(320) NOT NULL,
	`accessLevel` enum('view','edit') NOT NULL DEFAULT 'view',
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_shares_id` PRIMARY KEY(`id`)
);
