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
 * Retrieves the currently active authenticated user
 */
export async function getCurrentUser() {
  try {
    // 1. Check active session
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
 * Signs out user and clears cached session and cached credits
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (e) {}
  localStorage.removeItem('pm_cached_user');
  
  // Clean up all local credit cache keys so next login fetches clean data from Supabase
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('pm_credits_') || key.startsWith('pm_paid_credits_') || key.startsWith('pm_mutation_') || key.startsWith('pm_sync_') || key.startsWith('pm_claimed_signup_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Helper to get the localStorage key for credits
 */
export function getCreditsStorageKey(userId) {
  const isRegistered = userId && userId !== 'demo-user-id';
  return isRegistered ? `pm_credits_${userId}` : 'pm_guest_credits';
}

/**
 * Syncs credits to Supabase profiles table
 */
export async function syncCreditsToSupabase(userId, credits) {
  if (!userId || userId === 'demo-user-id') return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ credits })
      .eq('id', userId);

    if (!error) return true;
  } catch (e) {
    console.warn('syncCreditsToSupabase exception:', e);
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, credits }, { onConflict: 'id' });
    return !error;
  } catch (e) {
    return false;
  }
}

/**
 * Gets real persistent credits.
 * Supabase profiles table is the single source of truth for registered users.
 */
export async function getEffectiveCredits(userId) {
  const isRegistered = userId && userId !== 'demo-user-id';
  const userKey = getCreditsStorageKey(userId);

  if (isRegistered) {
    // Purge any stale legacy keys
    localStorage.removeItem(`pm_paid_credits_${userId}`);
    localStorage.removeItem(`pm_mutation_ts_${userKey}`);
    localStorage.removeItem(`pm_sync_ts_${userKey}`);
    localStorage.removeItem(`pm_claimed_signup_${userKey}`);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (!error && profile && typeof profile.credits === 'number') {
        const valid = Math.max(0, profile.credits);
        localStorage.setItem(userKey, valid.toString());
        return valid;
      }

      // If new profile with no record or null credits, initialize to 50
      if (!profile || profile.credits === null || profile.credits === undefined) {
        await supabase
          .from('profiles')
          .upsert({ id: userId, credits: 5 }, { onConflict: 'id' });
        localStorage.setItem(userKey, '5');
        return 5;
      }
    } catch (e) {
      console.warn('Supabase fetch error, fallback to cached:', e);
    }

    // Offline cache fallback
    const cached = localStorage.getItem(userKey);
    return cached !== null ? Math.max(0, parseInt(cached, 10) || 0) : 5;
  }

  // Guest mode
  const guestCached = localStorage.getItem('pm_guest_credits');
  if (guestCached === null) {
    localStorage.setItem('pm_guest_credits', '5');
    return 5;
  }
  return Math.max(0, parseInt(guestCached, 10) || 0);
}

/**
 * Deducts 1 credit from Supabase and localStorage
 */
export async function deductCredit(userId) {
  const isRegistered = userId && userId !== 'demo-user-id';
  const userKey = getCreditsStorageKey(userId);
  const current = await getEffectiveCredits(userId);
  const newCredits = Math.max(0, current - 1);

  localStorage.setItem(userKey, newCredits.toString());

  if (isRegistered) {
    try {
      await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);
    } catch (e) {
      console.warn('Supabase deduct credit error:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: newCredits, userId }
  }));

  return newCredits;
}

/**
 * Adds credits upon verified Razorpay payment
 */
export async function addPaidCredits(userId, amount, paymentId) {
  const isRegistered = userId && userId !== 'demo-user-id';
  const userKey = getCreditsStorageKey(userId);

  const current = await getEffectiveCredits(userId);
  const newTotal = current + amount;

  localStorage.setItem(userKey, newTotal.toString());

  if (isRegistered) {
    try {
      await supabase
        .from('profiles')
        .update({ credits: newTotal })
        .eq('id', userId);
    } catch (e) {
      console.error('Supabase addPaidCredits error:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: newTotal, userId }
  }));

  console.log(`Payment confirmed [${paymentId}]: Added ${amount} credits. New total: ${newTotal}`);
  return newTotal;
}

/**
 * Resets credits (for new signups or explicit admin balance resets)
 */
export async function resetToSignupCredits(userId, target = 5) {
  const isRegistered = userId && userId !== 'demo-user-id';
  const userKey = getCreditsStorageKey(userId);

  localStorage.setItem(userKey, target.toString());

  if (isRegistered) {
    try {
      await supabase
        .from('profiles')
        .update({ credits: target })
        .eq('id', userId);
    } catch (e) {}
  }

  window.dispatchEvent(new CustomEvent('pm_credits_updated', {
    detail: { credits: target, userId }
  }));

  return target;
}
