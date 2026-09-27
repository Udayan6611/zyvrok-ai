import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xfezjftwdaykfznrawdu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZXpqZnR3ZGF5a2Z6bnJhd2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNjQ3NzYsImV4cCI6MjEwMzY0MDc3Nn0.mHaPl3PP2p5X3foMjip75AfHX4oFWOY_etLqAoQH_mY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

/**
 * Retrieves the currently active authenticated user with multi-layer persistence
 */
export async function getCurrentUser() {
  try {
    // 1. Check active session (instant read from localStorage)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      localStorage.setItem('pm_cached_user', JSON.stringify({
        id: session.user.id,
        email: session.user.email
      }));
      return session.user;
    }

    // 2. Check user from server
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem('pm_cached_user', JSON.stringify({
        id: user.id,
        email: user.email
      }));
      return user;
    }
  } catch (err) {
    console.warn('Supabase auth session read note:', err);
  }

  // 3. Fallback to cached authenticated user profile
  try {
    const cached = localStorage.getItem('pm_cached_user');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  return null;
}

/**
 * Signs out user and clears cached session
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (e) {}
  localStorage.removeItem('pm_cached_user');
}

/**
 * Helper to get the localStorage key for credits
 */
export function getCreditsStorageKey(userId) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  return isRegistered ? `pm_credits_${userId}` : 'pm_guest_credits';
}

/**
 * Helper to get the localStorage key for paid credits
 */
export function getPaidCreditsStorageKey(userId) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  return isRegistered ? `pm_paid_credits_${userId}` : 'pm_guest_paid_credits';
}

/**
 * Tries every method to persist credits to Supabase profiles table
 */
export async function syncCreditsToSupabase(userId, credits) {
  if (!userId || userId === 'demo-user-id') return false;

  let success = false;

  // 1. Try direct UPDATE (safest for RLS when row already exists)
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ credits: credits })
      .eq('id', userId)
      .select();

    if (!error && data && data.length > 0) {
      success = true;
    } else if (error) {
      console.warn('Supabase profile UPDATE note:', error.message);
    }
  } catch (e) {
    console.warn('Supabase profile UPDATE exception:', e);
  }

  // 2. If update didn't touch any row (e.g. profile row doesn't exist yet), try UPSERT/INSERT
  if (!success) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, credits: credits }, { onConflict: 'id' })
        .select();

      if (!error && data && data.length > 0) {
        success = true;
      } else if (error) {
        console.warn('Supabase profile UPSERT note:', error.message);
      }
    } catch (e) {
      console.warn('Supabase profile UPSERT exception:', e);
    }
  }

  if (success) {
    const userKey = getCreditsStorageKey(userId);
    localStorage.setItem(`pm_sync_ts_${userKey}`, Date.now().toString());
  }

  return success;
}

/**
 * Resets or claims the 50 Free Signup credits for user or guest
 */
export async function resetToSignupCredits(userId, target = 50) {
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
 * Robustly synchronizes with Supabase profiles table AND preserves local transactions.
 * Guaranteed to reflect top-ups and never silently revert to stale database values!
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
    let postCount = null;

    try {
      // 1. Fetch credits from Supabase profiles table
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (!profileErr && profile && typeof profile.credits === 'number') {
        dbCredits = profile.credits;
      }

      // 2. Also check how many posts the user has actually generated
      // This is crucial to detect the "stuck at 3 credits" bug where a user with 0 or few posts was given 3 credits by mistake instead of 50.
      try {
        const { count, error: countErr } = await supabase
          .from('repurposed_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        if (!countErr && typeof count === 'number') {
          postCount = count;
        }
      } catch (e) {}
    } catch (e) {
      console.warn('Supabase profile check note:', e);
    }

    // RESOLUTION LOGIC:
    // Case A: The user was stuck at 3 credits (or <= 3) despite having 0 or few generated posts!
    // A new user is guaranteed 50 free signup credits. If postCount is low (e.g. < 5) and credits are <= 3 with no paid credits,
    // this was caused by an initial table default of 3 in Supabase. We automatically correct it to 50 - postCount + paidCredits!
    const isStuckAtDefaultThree = (dbCredits !== null && dbCredits <= 3) && (localVal === null || localVal <= 3) && ((postCount !== null && postCount < 5) || paidCredits > 0);

    let effective;

    if (isStuckAtDefaultThree) {
      const used = postCount !== null ? postCount : 0;
      effective = Math.max(0, 50 - used) + paidCredits;
      console.log(`Auto-correcting stale default 3 credits: restoring to ${effective} credits.`);
      localStorage.setItem(userKey, effective.toString());
      localStorage.setItem(`pm_mutation_ts_${userKey}`, Date.now().toString());
      syncCreditsToSupabase(userId, effective).catch(() => {});
      return effective;
    }

    // Case B: User has local paid credits or local pending mutation that hasn't synced to DB yet.
    // E.g. localVal is 503 (user paid 500), but DB still returns 3 because RLS prevented update.
    if (localVal !== null && (hasPendingMutation || localVal > (dbCredits ?? 0))) {
      // Keep the higher/local value so paid credits are NEVER lost!
      effective = localVal;
      syncCreditsToSupabase(userId, effective).catch(() => {});
      return effective;
    }

    // Case C: DB returned valid credits and there is no pending un-synced local mutation.
    if (dbCredits !== null) {
      effective = dbCredits;
      // If user had local paid credits recorded that aren't yet in dbCredits:
      if (paidCredits > 0 && dbCredits < paidCredits) {
        effective = dbCredits + paidCredits;
        syncCreditsToSupabase(userId, effective).catch(() => {});
      }
      localStorage.setItem(userKey, effective.toString());
      localStorage.setItem(`pm_sync_ts_${userKey}`, Date.now().toString());
      return effective;
    }

    // Case D: DB returned an error or record not found, fallback to local storage
    if (localVal !== null) {
      return localVal;
    }

    // Case E: First time user with no DB record and no local record: 50 free signup credits
    effective = 50;
    localStorage.setItem(userKey, '50');
    syncCreditsToSupabase(userId, 50).catch(() => {});
    return effective;
  }

  // Guest mode
  if (localVal === null) {
    localVal = 50;
    localStorage.setItem('pm_guest_credits', '50');
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
 * Adds credits upon VERIFIED Razorpay payment or Sandbox Simulation.
 * Supports BOTH registered users and guest testers so no one is blocked!
 */
export async function addPaidCredits(userId, amount, paymentId) {
  const isRegistered = Boolean(userId && userId !== 'demo-user-id' && userId !== 'guest');
  const userKey = getCreditsStorageKey(userId);
  const paidKey = getPaidCreditsStorageKey(userId);

  // 1. Get current accurate effective credits
  const current = await getEffectiveCredits(userId);
  const newTotal = current + amount;

  // 2. Persist to localStorage immediately
  localStorage.setItem(userKey, newTotal.toString());
  localStorage.setItem(`pm_mutation_ts_${userKey}`, Date.now().toString());

  // 3. Track cumulative paid credits so paid credits can never be wiped out
  const prevPaid = parseInt(localStorage.getItem(paidKey) || '0', 10) || 0;
  localStorage.setItem(paidKey, (prevPaid + amount).toString());

  // 4. Sync to Supabase
  if (isRegistered) {
    await syncCreditsToSupabase(userId, newTotal);
  }

  // 5. Notify all listeners/tabs of credit update
  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: newTotal, userId }
  }));

  console.log(`Payment verified [${paymentId}]: Added ${amount} credits. New total: ${newTotal}`);
  return newTotal;
}
