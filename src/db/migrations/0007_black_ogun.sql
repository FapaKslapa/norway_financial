CREATE TABLE `category_budget` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `category_budget_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` varchar(30) NOT NULL,
	`title` varchar(100) NOT NULL,
	`message` varchar(255) NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`link` varchar(100),
	`created_at` timestamp NOT NULL,
	CONSTRAINT `notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurrent_transaction` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`type` varchar(10) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`description` varchar(255) NOT NULL,
	`frequency` varchar(20) NOT NULL,
	`start_date` timestamp NOT NULL,
	`next_occurrence` timestamp NOT NULL,
	`last_executed` timestamp,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `recurrent_transaction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `category_budget` ADD CONSTRAINT `category_budget_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `category_budget` ADD CONSTRAINT `category_budget_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurrent_transaction` ADD CONSTRAINT `recurrent_transaction_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurrent_transaction` ADD CONSTRAINT `recurrent_transaction_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE set null ON UPDATE no action;