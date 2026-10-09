-- Per-user accounts. Wallets, Telegram names, and activity belong to one account.

CREATE TABLE IF NOT EXISTS account_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  chain text NOT NULL DEFAULT 'solana',
  role text NOT NULL DEFAULT 'investor',
  telegram text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_users_wallet_address_unique UNIQUE (wallet_address)
);

CREATE TABLE IF NOT EXISTS telegram_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES account_users(id) ON DELETE SET NULL,
  wallet_address text,
  telegram text NOT NULL,
  agent_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT telegram_signups_agent_handle_unique UNIQUE (agent_slug, telegram)
);

CREATE TABLE IF NOT EXISTS user_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  kind text NOT NULL,
  ref text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_records_wallet_kind_ref_unique UNIQUE (wallet_address, kind, ref)
);

CREATE INDEX IF NOT EXISTS user_records_wallet_idx
  ON user_records (wallet_address, created_at DESC);

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_signups_email_unique UNIQUE (email)
);
