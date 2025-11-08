CREATE TABLE `claims` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`policy_id` text NOT NULL,
	`claim_number` text NOT NULL,
	`incident_date` text NOT NULL,
	`incident_description` text NOT NULL,
	`incident_location` text NOT NULL,
	`damage_description` text NOT NULL,
	`estimated_cost` real NOT NULL,
	`documents` text,
	`photos` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`submitted_at` text NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text,
	`approved_amount` real,
	`rejection_reason` text,
	`admin_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `claims_claim_number_unique` ON `claims` (`claim_number`);