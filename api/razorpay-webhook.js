import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (webhookSecret) {
    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    try {
      const payloadString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Razorpay Webhook signature mismatch');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    } catch (sigErr) {
      console.error('Signature verification error:', sigErr);
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event?.event;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      let userId = notes.userId;
      const userEmail = notes.userEmail || paymentEntity?.email;
      const paymentAmount = Number(paymentEntity?.amount) || 19900;
      
      // Starter is 50 credits (₹199 / 19900 paise); Pro is 150 credits (₹499 / 49900 paise)
      const creditsToAdd = Number(notes.credits) || (paymentAmount >= 40000 ? 150 : 50);
      const paymentId = paymentEntity?.id;

      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xfezjftwdaykfznrawdu.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // If user paid as guest or userId is missing, attempt resolution by email
      if ((!userId || userId === 'guest' || userId === 'demo-user-id') && userEmail) {
        try {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('id, credits')
            .eq('email', userEmail)
            .maybeSingle();

          if (profileByEmail?.id) {
            userId = profileByEmail.id;
            console.log(`Resolved guest payment ${paymentId} to registered user [${userId}] via email ${userEmail}`);
          }
        } catch (lookupErr) {
          console.warn('Profile lookup by email note:', lookupErr.message);
        }
      }

      if (userId && userId !== 'guest' && userId !== 'demo-user-id') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        const currentCredits = profile && typeof profile.credits === 'number' ? profile.credits : 0;
        const newTotal = currentCredits + creditsToAdd;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newTotal })
          .eq('id', userId);

        if (updateError) {
          console.error('Supabase webhook credit update failed:', updateError);
          return res.status(500).json({ error: 'Database update failed' });
        }

        console.log(`Webhook successfully credited user [${userId}] with ${creditsToAdd} credits. Payment: ${paymentId}`);
        return res.status(200).json({ status: 'success', credited: creditsToAdd, newTotal, userId });
      } else {
        console.log(`Webhook received guest payment [${paymentId}] for ${creditsToAdd} credits (email: ${userEmail || 'none'}). Ready for manual or client claim.`);
        return res.status(200).json({ 
          status: 'recorded_unlinked', 
          message: 'Payment received for guest. Can be claimed via paymentId.',
          paymentId, 
          creditsToAdd, 
          userEmail 
        });
      }
    }

    return res.status(200).json({ status: 'ignored', message: 'Event not actionable' });
  } catch (err) {
    console.error('Webhook processing exception:', err);
    return res.status(500).json({ error: err.message });
  }
}
