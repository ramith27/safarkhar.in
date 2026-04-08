ALTER TABLE "segments" ADD COLUMN "displayed_range_km" real;--> statement-breakpoint
ALTER TABLE "segments" ADD COLUMN "stop_type" text;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "initial_displayed_range_km" real;