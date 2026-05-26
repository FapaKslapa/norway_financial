ALTER TABLE `user_settings` ADD `ai_provider` varchar(20) DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `gemini_api_key` varchar(255);--> statement-breakpoint
ALTER TABLE `user_settings` ADD `ollama_url` varchar(255) DEFAULT 'http://localhost:11434' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `ollama_model` varchar(100) DEFAULT 'llama3.2:1b' NOT NULL;