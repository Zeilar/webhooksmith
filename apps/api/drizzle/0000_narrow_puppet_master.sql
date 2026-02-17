CREATE TABLE `webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`blueprint` text NOT NULL,
	`receiver` text NOT NULL
);
