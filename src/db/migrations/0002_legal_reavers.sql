CREATE TABLE `todo_list` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `todo_list_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `todo` ADD `todo_list_id` varchar(36);--> statement-breakpoint
ALTER TABLE `todo_list` ADD CONSTRAINT `todo_list_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_todo_list_id_todo_list_id_fk` FOREIGN KEY (`todo_list_id`) REFERENCES `todo_list`(`id`) ON DELETE cascade ON UPDATE no action;