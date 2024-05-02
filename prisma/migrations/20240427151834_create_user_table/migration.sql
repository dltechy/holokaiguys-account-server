-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL,
    "discord_id" TEXT NOT NULL,
    "discord_username" TEXT NOT NULL,
    "discord_display_name" TEXT NOT NULL,
    "discord_avatar_hash" TEXT,
    "discord_avatar_filename" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_discord_id_key" ON "user"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_discord_username_key" ON "user"("discord_username");

-- CreateIndex
CREATE INDEX "user_is_super_admin_idx" ON "user"("is_super_admin");

-- CreateIndex
CREATE INDEX "user_discord_display_name_idx" ON "user"("discord_display_name");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "user"("created_at");

-- CreateIndex
CREATE INDEX "user_updated_at_idx" ON "user"("updated_at");
