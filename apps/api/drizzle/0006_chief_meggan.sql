CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`per_page` integer DEFAULT 12 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
