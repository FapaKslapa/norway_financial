CREATE TABLE `category` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(100) NOT NULL,
	`color` varchar(7) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `category_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `todo` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`title` varchar(255) NOT NULL,
	`notes` text,
	`completed` boolean NOT NULL DEFAULT false,
	`estimated_amount` decimal(10,2),
	`estimated_currency` varchar(3),
	`converted_to_transaction_id` varchar(36),
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `todo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`type` varchar(20) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`amount_eur` decimal(10,2) NOT NULL,
	`amount_nok` decimal(10,2) NOT NULL,
	`exchange_rate` decimal(10,4) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `transaction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`target_monthly_budget` decimal(10,2) NOT NULL,
	`max_monthly_budget` decimal(10,2) NOT NULL,
	`preferred_currency` varchar(3) NOT NULL DEFAULT 'NOK',
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `category` ADD CONSTRAINT `category_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_converted_to_transaction_id_transaction_id_fk` FOREIGN KEY (`converted_to_transaction_id`) REFERENCES `transaction`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;