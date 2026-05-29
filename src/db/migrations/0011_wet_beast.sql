ALTER TABLE `category_budget` MODIFY COLUMN `amount` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `recurrent_transaction` MODIFY COLUMN `amount` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_expense` MODIFY COLUMN `amount_nok` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `shared_expense` MODIFY COLUMN `split_amount_nok` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `todo` MODIFY COLUMN `estimated_amount` decimal(15,2);--> statement-breakpoint
ALTER TABLE `transaction` MODIFY COLUMN `amount` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` MODIFY COLUMN `amount_eur` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` MODIFY COLUMN `amount_nok` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` MODIFY COLUMN `target_monthly_budget` decimal(15,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` MODIFY COLUMN `max_monthly_budget` decimal(15,2) NOT NULL;