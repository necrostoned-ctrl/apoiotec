CREATE TABLE "backup_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"file_size" integer,
	"status" text DEFAULT 'sucesso',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"user_id" integer DEFAULT 1,
	"created_by_user_id" integer DEFAULT 1,
	"equipment" text NOT NULL,
	"service_type" text NOT NULL,
	"priority" text DEFAULT 'media' NOT NULL,
	"description" text NOT NULL,
	"internal_notes" text,
	"status" text DEFAULT 'aguardando' NOT NULL,
	"progress" integer DEFAULT 0,
	"call_date" timestamp,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"cpf" text,
	"document_type" text DEFAULT 'cpf',
	"address" text,
	"city" text,
	"state" text,
	"status" text DEFAULT 'ativo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "download_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"type" text DEFAULT 'system' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"resolution" text,
	"client_id" integer,
	"call_id" integer,
	"service_id" integer,
	"user_id" integer DEFAULT 1 NOT NULL,
	"created_by_user_id" integer DEFAULT 1,
	"completed_by_user_id" integer,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"original_amount" numeric(10, 2),
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"service_amount" numeric(10, 2),
	"product_amount" numeric(10, 2),
	"service_details" text,
	"product_details" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"due_date" timestamp,
	"paid_at" timestamp,
	"completed_at" timestamp,
	"call_date" timestamp,
	"service_date" timestamp,
	"billing_date" timestamp DEFAULT now() NOT NULL,
	"parent_transaction_id" integer,
	"installment_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "history_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" integer,
	"service_id" integer,
	"transaction_id" integer,
	"event_type" text NOT NULL,
	"description" text,
	"user_id" integer DEFAULT 1,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"problem" text NOT NULL,
	"solution" text NOT NULL,
	"keywords" text,
	"tags" text,
	"views" integer DEFAULT 0,
	"helpful" integer DEFAULT 0,
	"user_id" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'outros' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"notification_type" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preventive_maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"equipment_type" text,
	"frequency" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"completed_date" timestamp,
	"status" text DEFAULT 'pendente' NOT NULL,
	"notes" text,
	"user_id" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"call_id" integer,
	"client_id" integer NOT NULL,
	"items" text NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" numeric(10, 2),
	"estimated_time" text,
	"category" text,
	"priority" text DEFAULT 'media' NOT NULL,
	"client_id" integer,
	"call_id" integer,
	"user_id" integer DEFAULT 1,
	"created_by_user_id" integer DEFAULT 1,
	"products" text,
	"call_date" timestamp,
	"service_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_activation" (
	"id" serial PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"hardware_fingerprint" text NOT NULL,
	"failed_attempts" integer DEFAULT 0,
	"blocked_until" timestamp,
	"activated_at" timestamp DEFAULT now() NOT NULL,
	"last_attempt" timestamp,
	CONSTRAINT "system_activation_hardware_fingerprint_unique" UNIQUE("hardware_fingerprint")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'Apoiotec Informática' NOT NULL,
	"cnpj" text,
	"address" text,
	"phone" text,
	"email" text,
	"pdf_subtitle" text DEFAULT 'Assessoria e Assistência Técnica em Informática',
	"pdf_phone1" text,
	"pdf_phone2" text,
	"font_size" text DEFAULT '26' NOT NULL,
	"pdf_font_size" text DEFAULT '16' NOT NULL,
	"font_family" text DEFAULT 'system' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"primary_color" text DEFAULT '#2563eb' NOT NULL,
	"secondary_color" text DEFAULT '#00ff41' NOT NULL,
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bot_token" text NOT NULL,
	"chat_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"cnpj" text,
	"address" text,
	"phone" text,
	"email" text,
	"font_size" text DEFAULT '16',
	"pdf_font_size" text DEFAULT '12',
	"font_family" text DEFAULT 'Arial',
	"theme" text DEFAULT 'light' NOT NULL,
	"primary_color" text DEFAULT '#2563eb' NOT NULL,
	"secondary_color" text DEFAULT '#00ff41' NOT NULL,
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
