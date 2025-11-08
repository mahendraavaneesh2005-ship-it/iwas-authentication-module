CREATE TABLE `claim_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`report_type` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`total_claims` integer NOT NULL,
	`total_claimed_amount` real NOT NULL,
	`total_approved_amount` real NOT NULL,
	`claims_data` text NOT NULL,
	`generated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `health_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`application_number` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`gender` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`zip_code` text NOT NULL,
	`height` text NOT NULL,
	`weight` text NOT NULL,
	`pre_existing_conditions` text,
	`medications` text,
	`smoker` text NOT NULL,
	`alcohol_consumption` text,
	`exercise_frequency` text,
	`family_medical_history` text,
	`emergency_contact_name` text NOT NULL,
	`emergency_contact_phone` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`selected_plan_id` integer,
	`calculated_premium` real,
	`submitted_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `health_applications_application_number_unique` ON `health_applications` (`application_number`);--> statement-breakpoint
CREATE TABLE `health_claims` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`policy_id` text NOT NULL,
	`claim_number` text NOT NULL,
	`treatment_date` text NOT NULL,
	`hospital_name` text NOT NULL,
	`doctor_name` text NOT NULL,
	`diagnosis` text NOT NULL,
	`treatment_description` text NOT NULL,
	`claim_amount` real NOT NULL,
	`documents` text,
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
CREATE UNIQUE INDEX `health_claims_claim_number_unique` ON `health_claims` (`claim_number`);--> statement-breakpoint
CREATE TABLE `health_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`coverage_amount` real NOT NULL,
	`monthly_premium_base` real NOT NULL,
	`features` text,
	`deductible` real NOT NULL,
	`copay_percentage` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `health_policies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`application_id` integer NOT NULL,
	`plan_id` integer NOT NULL,
	`policy_number` text NOT NULL,
	`policyholder_name` text NOT NULL,
	`email` text NOT NULL,
	`monthly_premium` real NOT NULL,
	`coverage_amount` real NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`payment_status` text NOT NULL,
	`renewal_date` text NOT NULL,
	`renewal_reminder_sent` text DEFAULT 'no' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `health_policies_policy_number_unique` ON `health_policies` (`policy_number`);