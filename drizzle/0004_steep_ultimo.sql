CREATE TABLE `property_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`property_id` int NOT NULL,
	`user_id` int,
	`event_type` enum('price_change','status_change','note_added','viewed','watchlist_added','watchlist_removed','alert_triggered','cma_generated','score_calculated','offer_made','inspection_scheduled','other') NOT NULL,
	`event_title` varchar(255) NOT NULL,
	`event_description` text,
	`old_value` text,
	`new_value` text,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_history_id` PRIMARY KEY(`id`)
);
