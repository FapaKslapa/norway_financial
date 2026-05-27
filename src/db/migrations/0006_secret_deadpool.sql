CREATE TABLE `friend_group` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`creator_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `friend_group_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_member` (
	`id` varchar(36) NOT NULL,
	`group_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `group_member_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `shared_expense` ADD `group_id` varchar(36);--> statement-breakpoint
ALTER TABLE `transaction` ADD `group_id` varchar(36);--> statement-breakpoint
ALTER TABLE `friend_group` ADD CONSTRAINT `friend_group_creator_id_user_id_fk` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_member` ADD CONSTRAINT `group_member_group_id_friend_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `friend_group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_member` ADD CONSTRAINT `group_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shared_expense` ADD CONSTRAINT `shared_expense_group_id_friend_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `friend_group`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_group_id_friend_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `friend_group`(`id`) ON DELETE set null ON UPDATE no action;