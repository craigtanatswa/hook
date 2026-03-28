


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "is_bootstrap" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_users_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advert_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advert_id" "uuid",
    "media_url" "text" NOT NULL,
    "media_type" "text" NOT NULL,
    "order_index" integer DEFAULT 0,
    "focal_point" "text" DEFAULT '50% 50%'::"text" NOT NULL,
    CONSTRAINT "advert_media_media_type_check" CHECK (("media_type" = ANY (ARRAY['image'::"text", 'gif'::"text", 'video'::"text"])))
);


ALTER TABLE "public"."advert_media" OWNER TO "postgres";


COMMENT ON TABLE "public"."advert_media" IS 'Ordered media URLs (Storage or external); no binary in DB';



CREATE TABLE IF NOT EXISTS "public"."advert_ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advert_id" "uuid" NOT NULL,
    "rater_id" "text" NOT NULL,
    "rating" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "advert_ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."advert_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."adverts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid",
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "age" integer,
    "location" "text" NOT NULL,
    "description" "text",
    "phone" "text" NOT NULL,
    "whatsapp" "text" NOT NULL,
    "email" "text",
    "expiry_date" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "premium" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "body_type" "text" DEFAULT 'Average'::"text" NOT NULL,
    "gender" "text" DEFAULT 'Unknown'::"text" NOT NULL,
    "category" "text" DEFAULT 'Soft & slow'::"text" NOT NULL,
    "short_description" "text" DEFAULT ''::"text" NOT NULL,
    "full_description" "text" DEFAULT ''::"text" NOT NULL,
    "premium_until" timestamp with time zone,
    "vip" boolean DEFAULT false NOT NULL,
    "vip_until" timestamp with time zone,
    CONSTRAINT "adverts_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."adverts" OWNER TO "postgres";


COMMENT ON TABLE "public"."adverts" IS 'Hook listings; media URLs live in advert_media';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "advert_id" "uuid",
    "user_id" "uuid",
    "rating" integer,
    "review" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" integer DEFAULT 1 NOT NULL,
    "maintenance" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "site_settings_id_check" CHECK (("id" = 1))
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'provider'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advert_media"
    ADD CONSTRAINT "advert_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advert_ratings"
    ADD CONSTRAINT "advert_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."adverts"
    ADD CONSTRAINT "adverts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "advert_media_advert_id_idx" ON "public"."advert_media" USING "btree" ("advert_id");



CREATE INDEX "advert_media_advert_idx" ON "public"."advert_media" USING "btree" ("advert_id");



CREATE UNIQUE INDEX "advert_ratings_one_per_rater" ON "public"."advert_ratings" USING "btree" ("advert_id", "rater_id");



CREATE INDEX "adverts_created_idx" ON "public"."adverts" USING "btree" ("created_at" DESC);



CREATE INDEX "adverts_expiry_idx" ON "public"."adverts" USING "btree" ("expiry_date");



CREATE INDEX "adverts_premium_idx" ON "public"."adverts" USING "btree" ("premium");



CREATE INDEX "adverts_status_expiry_idx" ON "public"."adverts" USING "btree" ("status", "expiry_date");



CREATE INDEX "adverts_status_idx" ON "public"."adverts" USING "btree" ("status");



CREATE INDEX "ratings_advert_idx" ON "public"."ratings" USING "btree" ("advert_id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advert_media"
    ADD CONSTRAINT "advert_media_advert_id_fkey" FOREIGN KEY ("advert_id") REFERENCES "public"."adverts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advert_ratings"
    ADD CONSTRAINT "advert_ratings_advert_id_fkey" FOREIGN KEY ("advert_id") REFERENCES "public"."adverts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."adverts"
    ADD CONSTRAINT "adverts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."adverts"
    ADD CONSTRAINT "adverts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_advert_id_fkey" FOREIGN KEY ("advert_id") REFERENCES "public"."adverts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



CREATE POLICY "Public can insert ratings" ON "public"."advert_ratings" FOR INSERT WITH CHECK ((("rating" >= 1) AND ("rating" <= 5)));



CREATE POLICY "Public can read active adverts" ON "public"."adverts" FOR SELECT USING ((("status" = 'active'::"text") AND ("expiry_date" > "now"())));



CREATE POLICY "Public can read media for active adverts" ON "public"."advert_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."adverts"
  WHERE (("adverts"."id" = "advert_media"."advert_id") AND ("adverts"."status" = 'active'::"text") AND ("adverts"."expiry_date" > "now"())))));



CREATE POLICY "Public can read ratings" ON "public"."advert_ratings" FOR SELECT USING (true);



CREATE POLICY "Public can update own rating" ON "public"."advert_ratings" FOR UPDATE USING (true) WITH CHECK ((("rating" >= 1) AND ("rating" <= 5)));



CREATE POLICY "Public read active adverts" ON "public"."adverts" FOR SELECT USING ((("status" = 'active'::"text") AND ("expiry_date" > "now"())));



CREATE POLICY "Public read advert_media" ON "public"."advert_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."adverts" "a"
  WHERE (("a"."id" = "advert_media"."advert_id") AND ("a"."status" = 'active'::"text") AND ("a"."expiry_date" > "now"())))));



ALTER TABLE "public"."advert_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."advert_media" TO "anon";
GRANT ALL ON TABLE "public"."advert_media" TO "authenticated";
GRANT ALL ON TABLE "public"."advert_media" TO "service_role";



GRANT ALL ON TABLE "public"."advert_ratings" TO "anon";
GRANT ALL ON TABLE "public"."advert_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."advert_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."adverts" TO "anon";
GRANT ALL ON TABLE "public"."adverts" TO "authenticated";
GRANT ALL ON TABLE "public"."adverts" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."ratings" TO "anon";
GRANT ALL ON TABLE "public"."ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."ratings" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































