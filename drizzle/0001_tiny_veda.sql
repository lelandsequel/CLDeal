CREATE TABLE `dealAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`propertyType` enum('single-family','multifamily','both') NOT NULL,
	`minPrice` int,
	`maxPrice` int,
	`minProfitMargin` int,
	`location` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dealAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`zipCode` varchar(10),
	`propertyType` enum('single-family','multifamily') NOT NULL,
	`currentPrice` int NOT NULL,
	`estimatedARV` int,
	`estimatedRenovationCost` int,
	`estimatedProfitPotential` int,
	`propertyCondition` varchar(100),
	`daysOnMarket` int,
	`sellerType` varchar(100),
	`listingUrl` text,
	`mlsNumber` varchar(50),
	`beds` int,
	`baths` int,
	`squareFeet` int,
	`lotSize` int,
	`sellerContactInfo` text,
	`photoUrls` text,
	`dataSource` varchar(100),
	`profitScore` int,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`searchParams` text NOT NULL,
	`resultsCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`)
);
