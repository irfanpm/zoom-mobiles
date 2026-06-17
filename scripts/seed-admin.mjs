/**
 * ────────────────────────────────────────────────────────────────────
 * SEED FIRST ADMIN USER (zero dependencies — uses raw fetch)
 * ────────────────────────────────────────────────────────────────────
 * Usage:
 *   node scripts/seed-admin.mjs
 *
 * Reads env from .env.local. Creates the auth user AND admin_users row.
 * Safe to re-run: if user already exists, it'll reset the password and
 * ensure the admin_users row is set.
 * ────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'node:fs';

// ── EDIT THESE if you want different credentials ──────────────────
const ADMIN_EMAIL = 'admin@zoommobiles.in';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_FULL_NAME = 'Zoom Admin';
const ADMIN_ROLE = 'super_admin'; // 'admin' or 'super_admin'
// ──────────────────────────────────────────────────────────────────

// Load env from .env.local
try {
  const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.error('❌ Could not read .env.local — create it first.');
  process.exit(1);
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !SVC) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  apikey: SVC,
  Authorization: `Bearer ${SVC}`,
};

async function main() {
  console.log('\n🔐 Seeding admin user…');
  console.log('   Email:    ' + ADMIN_EMAIL);
  console.log('   Password: ' + ADMIN_PASSWORD);
  console.log('   Role:     ' + ADMIN_ROLE);
  console.log('');

  let userId = null;

  // 1. Try to create the auth user
  const createRes = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_FULL_NAME },
    }),
  });

  if (createRes.ok) {
    const data = await createRes.json();
    userId = data.id;
    console.log('✅ Auth user created.');
  } else {
    const err = await createRes.json().catch(() => ({}));
    const alreadyExists =
      err.code === 'email_exists' ||
      JSON.stringify(err).toLowerCase().includes('already');

    if (alreadyExists) {
      console.log('⚠️  User already exists — looking up & resetting password…');
      // List users and find by email
      const listRes = await fetch(
        `${URL_}/auth/v1/admin/users?per_page=200`,
        { headers },
      );
      if (!listRes.ok) {
        console.error('❌ Could not list users:', await listRes.text());
        process.exit(1);
      }
      const listData = await listRes.json();
      const users = listData.users ?? listData;
      const found = users.find(
        (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      );
      if (!found) {
        console.error('❌ Could not find existing user with that email.');
        process.exit(1);
      }
      userId = found.id;

      // Update password
      const updRes = await fetch(`${URL_}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ password: ADMIN_PASSWORD, email_confirm: true }),
      });
      if (!updRes.ok) {
        console.error('❌ Password reset failed:', await updRes.text());
        process.exit(1);
      }
      console.log('✅ Password reset for existing user.');
    } else {
      console.error('❌ Auth user creation failed:');
      console.error(JSON.stringify(err, null, 2));
      process.exit(1);
    }
  }

  // 2. Upsert into admin_users
  const upsertRes = await fetch(
    `${URL_}/rest/v1/admin_users?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: userId,
        full_name: ADMIN_FULL_NAME,
        role: ADMIN_ROLE,
        email: ADMIN_EMAIL,
        is_active: true,
      }),
    },
  );

  if (!upsertRes.ok) {
    const body = await upsertRes.text();
    console.error('❌ admin_users insert failed:', body);
    console.error('   Did you run supabase/schema.sql in the SQL Editor first?');
    process.exit(1);
  }

  console.log('✅ admin_users row set.\n');
  console.log('───────────────────────────────────────────────────');
  console.log('  🎉 DONE! You can now log in at:');
  console.log('  http://localhost:3000/admin/login');
  console.log('');
  console.log('  Email:    ' + ADMIN_EMAIL);
  console.log('  Password: ' + ADMIN_PASSWORD);
  console.log('───────────────────────────────────────────────────\n');
}

main().catch((e) => {
  console.error('❌ Unexpected error:', e);
  process.exit(1);
});
