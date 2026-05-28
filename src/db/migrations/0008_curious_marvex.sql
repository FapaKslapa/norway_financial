ALTER TABLE `recurrent_transaction` ADD `status` varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `recurrent_transaction` ADD `end_date` timestamp;