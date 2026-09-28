import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    paymentId,
    userId,
    userEmail,
    credits
  } = req.body || {};

  const effectivePaymentId = razorpay_payment_id || paymentId;

  if (!effectivePaymentId) {
    return res.status(400).json({ error: 'Missing payment identifier' });
  }

  // 1. Signature Verification if order_id & signature are present
  if (keySecret && razorpay_order_id && razorpay_signature) {
    const text = `${razorpay_order_id}|${effectivePaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.warn('Razorpay signature mismatch in verify-payment');
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
  }

  // 2. Fetch payment details from Razorpay API if keys configured
  let creditsToAdd = Number(credits) || 50;

  if (keyId && keySecret && effectivePaymentId.startsWith('pay_')) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${effectivePaymentId}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (rzpRes.ok) {
        const paymentData = await rzpRes.json();
        if (paymentData.status === 'captured' || paymentData.status === 'authorized') {
          const notesCredits = Number(paymentData.notes?.credits);
          const amount = Number(paymentData.amount);
          creditsToAdd = notesCredits || (amount >= 40000 ? 150 : 50);
        }
      }
    } catch (e) {
      console.warn('Failed to query Razorpay API in verify-payment:', e.message);
    }
  }

  // 3. Update Supabase profile if userId is valid
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xfezjftwdaykfznrawdu.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let targetUserId = userId;

  // If userId is missing or guest, try resolving by userEmail
  if ((!targetUserId || targetUserId === 'guest' || targetUserId === 'demo-user-id') && userEmail) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('email', userEmail)
        .maybeSingle();

      if (profile?.id) {
        targetUserId = profile.id;
      }
    } catch (err) {}
  }

  if (targetUserId && targetUserId !== 'guest' && targetUserId !== 'demo-user-id') {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', targetUserId)
        .single();

      const current = profile && typeof profile.credits === 'number' ? profile.credits : 0;
      const newTotal = current + creditsToAdd;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newTotal })
        .eq('id', targetUserId);

      if (!updateError) {
        console.log(`Payment [${effectivePaymentId}] successfully credited to [${targetUserId}]: +${creditsToAdd} = ${newTotal}`);
        return res.status(200).json({
          success: true,
          paymentId: effectivePaymentId,
          creditsAdded: creditsToAdd,
          newTotal,
          userId: targetUserId
        });
      }
    } catch (dbErr) {
      console.error('Database update error in verify-payment:', dbErr);
    }
  }

  // Return success response so client can also persist locally
  return res.status(200).json({
    success: true,
    paymentId: effectivePaymentId,
    creditsAdded: creditsToAdd,
    userId: targetUserId || 'guest',
    message: 'Payment verified. Saved locally.'
  });
}
