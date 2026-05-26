CREATE TABLE `friendship` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`friend_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `friendship_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_expense` (
	`id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`payer_id` varchar(36) NOT NULL,
	`borrower_id` varchar(36) NOT NULL,
	`amount_nok` decimal(10,2) NOT NULL,
	`split_amount_nok` decimal(10,2) NOT NULL,
	`settled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `shared_expense_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_friend_id_user_id_fk` FOREIGN KEY (`friend_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_sender_id_user_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_expense` ADD CONSTRAINT `shared_expense_transaction_id_transaction_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transaction`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_expense` ADD CONSTRAINT `shared_expense_payer_id_user_id_fk` FOREIGN KEY (`payer_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_expense` ADD CONSTRAINT `shared_expense_borrower_id_user_id_fk` FOREIGN KEY (`borrower_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;