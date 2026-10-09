import postgres from 'postgres';
import { isAdminWallet } from '@/lib/auth';

export type AccountRole = 'investor' | 'deployer' | 'admin';

export type AccountUser = {
  id: string;
  walletAddress: string;
  chain: string;
  role: AccountRole;
  telegram: string | null;
  createdAt: string;
  lastSeenAt: string;
};

type Sql = ReturnType<typeof postgres>;

const globalSql = globalThis as typeof globalThis & {
  __arcaSql?: Sql;
  __arcaSchema?: Promise<void>;
};

function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!globalSql.__arcaSql) {
    globalSql.__arcaSql = postgres(url, {
      ssl: 'require',
      max: 5,
      prepare: false,
      idle_timeout: 20,
    });
  }
  return globalSql.__arcaSql;
}

export function ensureAccountSchema(): Promise<void> {
  if (!globalSql.__arcaSchema) {
    const sql = getSql();
    globalSql.__arcaSchema = sql`
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
      )
    `
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS telegram_signups (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES account_users(id) ON DELETE SET NULL,
            wallet_address text,
            telegram text NOT NULL,
            agent_slug text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT telegram_signups_agent_handle_unique UNIQUE (agent_slug, telegram)
          )
        `,
      )
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS user_records (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES account_users(id) ON DELETE CASCADE,
            wallet_address text NOT NULL,
            kind text NOT NULL,
            ref text NOT NULL,
            payload jsonb NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT user_records_wallet_kind_ref_unique UNIQUE (wallet_address, kind, ref)
          )
        `,
      )
      .then(
        () => sql`
          CREATE INDEX IF NOT EXISTS user_records_wallet_idx
          ON user_records (wallet_address, created_at DESC)
        `,
      )
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS waitlist_signups (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now(),
            CONSTRAINT waitlist_signups_email_unique UNIQUE (email)
          )
        `,
      )
      .then(() => undefined)
      .catch((error) => {
        globalSql.__arcaSchema = undefined;
        throw error;
      });
  }
  return globalSql.__arcaSchema;
}

function roleForWallet(wallet: string, requested?: AccountRole): AccountRole {
  if (isAdminWallet(wallet)) return 'admin';
  return requested ?? 'investor';
}

export async function upsertAccount(
  wallet: string,
  requestedRole?: AccountRole,
): Promise<AccountUser> {
  const address = wallet.trim();
  if (!address) throw new Error('Wallet is required');
  await ensureAccountSchema();
  const sql = getSql();
  const role = roleForWallet(address, requestedRole);
  const [row] = await sql<AccountUser[]>`
    INSERT INTO account_users (wallet_address, chain, role)
    VALUES (${address}, 'solana', ${role})
    ON CONFLICT (wallet_address) DO UPDATE
    SET
      last_seen_at = now(),
      updated_at = now(),
      role = CASE
        WHEN account_users.role = 'admin' OR EXCLUDED.role = 'admin' THEN 'admin'
        WHEN EXCLUDED.role = 'deployer' AND account_users.role = 'investor' THEN 'deployer'
        ELSE account_users.role
      END
    RETURNING
      id,
      wallet_address AS "walletAddress",
      chain,
      role,
      telegram,
      created_at AS "createdAt",
      last_seen_at AS "lastSeenAt"
  `;
  return row;
}

export async function saveTelegramSignup(input: {
  telegram: string;
  agent: string;
  wallet?: string | null;
}): Promise<void> {
  const telegram = input.telegram.trim().replace(/^@/, '').toLowerCase();
  const agent = input.agent.trim().toLowerCase() || 'apollo';
  const wallet = input.wallet?.trim() || null;
  await ensureAccountSchema();
  const sql = getSql();

  let userId: string | null = null;
  if (wallet) {
    const account = await upsertAccount(wallet);
    userId = account.id;
    await sql`
      UPDATE account_users
      SET telegram = ${telegram}, updated_at = now()
      WHERE id = ${userId}
    `;
  }

  await sql`
    INSERT INTO telegram_signups (user_id, wallet_address, telegram, agent_slug)
    VALUES (${userId}, ${wallet}, ${telegram}, ${agent})
    ON CONFLICT (agent_slug, telegram) DO UPDATE
    SET
      user_id = COALESCE(EXCLUDED.user_id, telegram_signups.user_id),
      wallet_address = COALESCE(EXCLUDED.wallet_address, telegram_signups.wallet_address)
  `;
}

export async function saveUserRecord(input: {
  wallet: string;
  kind: string;
  ref: string;
  payload: unknown;
  role?: AccountRole;
}): Promise<void> {
  const account = await upsertAccount(input.wallet, input.role);
  const sql = getSql();
  const payload = JSON.parse(JSON.stringify(input.payload));
  await sql`
    INSERT INTO user_records (user_id, wallet_address, kind, ref, payload)
    VALUES (
      ${account.id},
      ${account.walletAddress},
      ${input.kind},
      ${input.ref},
      ${sql.json(payload)}
    )
    ON CONFLICT (wallet_address, kind, ref) DO UPDATE
    SET payload = EXCLUDED.payload, user_id = EXCLUDED.user_id
  `;
}

export async function listUserRecords<T>(wallet: string, kind: string): Promise<T[]> {
  await ensureAccountSchema();
  const sql = getSql();
  const rows = await sql<{ payload: T }[]>`
    SELECT payload
    FROM user_records
    WHERE wallet_address = ${wallet.trim()} AND kind = ${kind}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => row.payload);
}

export async function listUserRecordsByKind<T>(
  kind: string,
): Promise<T[]> {
  await ensureAccountSchema();
  const sql = getSql();
  const rows = await sql<{ payload: T }[]>`
    SELECT payload
    FROM user_records
    WHERE kind = ${kind}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => row.payload);
}

export async function saveWaitlistEmail(email: string): Promise<void> {
  await ensureAccountSchema();
  const sql = getSql();
  const normalized = email.trim().toLowerCase();
  await sql`
    INSERT INTO waitlist_signups (email)
    VALUES (${normalized})
    ON CONFLICT (email) DO NOTHING
  `;
}

export type AccountListRow = {
  id: string;
  wallet: string;
  role: string;
  telegram: string | null;
  joined: string;
  totalContributed: number;
  agentsBacked: number;
};

export async function listAccounts(): Promise<AccountListRow[]> {
  await ensureAccountSchema();
  const sql = getSql();
  return sql<AccountListRow[]>`
    SELECT
      u.id,
      u.wallet_address AS wallet,
      u.role,
      u.telegram,
      u.created_at AS joined,
      COALESCE((
        SELECT SUM((r.payload->>'contributed')::numeric)
        FROM user_records r
        WHERE r.user_id = u.id AND r.kind = 'position'
      ), 0)::float AS "totalContributed",
      (
        SELECT COUNT(*)
        FROM user_records r
        WHERE r.user_id = u.id AND r.kind = 'position'
      )::int AS "agentsBacked"
    FROM account_users u
    ORDER BY u.created_at DESC
  `;
}
