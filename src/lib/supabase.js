import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfezjftwdaykfznrawdu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZXpqZnR3ZGF5a2Z6bnJhd2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNjQ3NzYsImV4cCI6MjEwMzY0MDc3Nn0.mHaPl3PP2p5X3foMjip75AfHX4oFWOY_etLqAoQH_mY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Storage key helpers
 */
export function getCreditsStorageKey(userId) {
  if (!userId || userId === 'demo-user-id' || userId === 'guest') {
    return 'pm_guest_credits';
  }
  return `pm_credits_${userId}`;
}

export function getPaidCreditsStorageKey(userId) {
  if (!userId || userId === 'demo-user-id' || userId === 'guest') {
    return 'pm_guest_paid_credits';
  }
  return `pm_paid_credits_${userId}`;
}

/**
 * Gets currently logged in user safely
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.warn('Error fetching current user:', err);
    return null;
  }
}

/**
 * Signs user out and clears local caches
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: 0, userId: null }
  }));
}

/**
 * Syncs credits to Supabase profiles table
 */
export async function syncCreditsToSupabase(userId, credits) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  if (!isRegistered) return false;

  const userKey = getCreditsStorageKey(userId);
  let success = false;

  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits })
      .eq('id', userId);

    if (!updateError) success = true;
  } catch (err) {
    console.warn('Direct update error, trying upsert:', err);
  }

  if (!success) {
    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: userId, credits }, { onConflict: 'id' });

      if (!upsertError) success = true;
    } catch (e) {
      console.warn('Upsert warning:', e);
    }
  }

  if (success) {
    localStorage.setItem(`pm_sync_ts_${userKey}`, Date.now().toString());
  }

  return success;
}

/**
 * Resets or claims the 5 Free Signup credits for user
 */
export async function resetToSignupCredits(userId, target = 5) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  const userKey = getCreditsStorageKey(userId);
  const paidKey = getPaidCreditsStorageKey(userId);

  const paidCredits = parseInt(localStorage.getItem(paidKey) || '0', 10) || 0;
  const newTotal = target + paidCredits;

  localStorage.setItem(userKey, newTotal.toString());
  localStorage.setItem(`pm_mutation_ts_${userKey}`, Date.now().toString());
  localStorage.setItem(`pm_claimed_signup_${userKey}`, 'true');

  if (isRegistered) {
    await syncCreditsToSupabase(userId, newTotal);
  }

  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: newTotal, userId }
  }));

  return newTotal;
}

/**
 * Gets real persistent credits for user or guest.
 * 
 * Rules:
 * 1. Guests have 0 free credits (must sign in to claim 5 free trial credits).
 * 2. New users get 5 free signup credits.
 * 3. Never auto-reset users back to 5 or 50 on refresh if they have used credits down to 0.
 * 4. Paid credits (₹199 = 50, ₹499 = 150) are never lost.
 */
export async function getEffectiveCredits(userId, options = {}) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  const userKey = getCreditsStorageKey(userId);
  const paidKey = getPaidCreditsStorageKey(userId);

  const cached = localStorage.getItem(userKey);
  let localVal = cached !== null ? parseInt(cached, 10) : null;
  if (isNaN(localVal)) localVal = null;

  const paidCredits = parseInt(localStorage.getItem(paidKey) || '0', 10) || 0;
  const lastMutationTs = parseInt(localStorage.getItem(`pm_mutation_ts_${userKey}`) || '0', 10);
  const lastSyncTs = parseInt(localStorage.getItem(`pm_sync_ts_${userKey}`) || '0', 10);
  const hasPendingMutation = lastMutationTs > lastSyncTs;

  if (isRegistered) {
    let dbCredits = null;

    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (!profileErr && profile && typeof profile.credits === 'number') {
        dbCredits = profile.credits;
      }
    } catch (e) {
      console.warn('Supabase profile check note:', e);
    }

    let effective;

    // Case A: User has pending local mutation (e.g. just deducted or added credits)
    if (localVal !== null && (hasPendingMutation || localVal > (dbCredits ?? 0))) {
      effective = localVal;
      syncCreditsToSupabase(userId, effective).catch(() => {});
      return effective;
    }

    // Case B: DB returned valid credits from Supabase
    if (dbCredits !== null) {
      effective = dbCredits;
      if (paidCredits > 0 && dbCredits < paidCredits) {
        effective = dbCredits + paidCredits;
        syncCreditsToSupabase(userId, effective).catch(() => {});
      }
      localStorage.setItem(userKey, effective.toString());
      localStorage.setItem(`pm_sync_ts_${userKey}`, Date.now().toString());
      return effective;
    }

    // Case C: DB returned an error or record not found, fallback to local storage
    if (localVal !== null) {
      return localVal;
    }

    // Case D: First time user with no DB record and no local record: 5 free signup credits
    effective = 5;
    localStorage.setItem(userKey, '5');
    syncCreditsToSupabase(userId, 5).catch(() => {});
    return effective;
  }

  // Guest mode: Guests have 0 credits. Must sign in to claim 5 free trial credits.
  if (localVal === null) {
    localVal = 0;
    localStorage.setItem('pm_guest_credits', '0');
  }
  return Math.max(0, localVal);
}

/**
 * Deducts 1 credit from Supabase and localStorage
 */
export async function deductCredit(userId) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  const userKey = getCreditsStorageKey(userId);
  const current = await getEffectiveCredits(userId);
  const newCredits = Math.max(0, current - 1);

  localStorage.setItem(userKey, newCredits.toString());
  localStorage.setItem(`pm_mutation_ts_${userKey}`, Date.now().toString());

  if (isRegistered) {
    syncCreditsToSupabase(userId, newCredits).catch((e) => {
      console.warn('Supabase credit deduction warning:', e);
    });
  }

  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: newCredits, userId }
  }));

  return newCredits;
}

/**
 * Adds credits upon VERIFIED Razorpay payment or recovery.
 * Starter: ₹199 -> 50 Credits
 * Pro:     ₹499 -> 150 Credits
 */
export async function addPaidCredits(userId, amount, paymentId) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  const userKey = getCreditsStorageKey(userId);
  const paidKey = getPaidCreditsStorageKey(userId);

  const current = await getEffectiveCredits(userId);
  const newTotal = current + amount;

  localStorage.setItem(userKey, newTotal.toString());
  localStorage.setItem(`pm_mutation_ts_${userKey}`, Date.now().toString());

  const prevPaid = parseInt(localStorage.getItem(paidKey) || '0', 10) || 0;
  localStorage.setItem(paidKey, (prevPaid + amount).toString());

  if (isRegistered) {
    await syncCreditsToSupabase(userId, newTotal);
  }

  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: newTotal, userId }
  }));

  return newTotal;
}