export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ 
      error: 'Razorpay keys not configured on server. Please set VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Environment Variables.' 
    });
  }

  try {
    const { 
      packType = 'starter', 
      amount, 
      currency = 'INR', 
      receipt = `rcpt_${Date.now()}`, 
      userId = 'guest', 
      userEmail = '', 
      credits 
    } = req.body || {};

    // Razorpay amounts are strictly in PAISE (1 INR = 100 Paise).
    // Starter: ₹199 -> 19900 paise -> 50 credits
    // Pro:     ₹499 -> 49900 paise -> 150 credits
    let amountInPaise;
    let creditsToAdd;

    if (packType === 'pro' || Number(amount) === 499 || Number(amount) === 49900) {
      amountInPaise = 49900;
      creditsToAdd = 150;
    } else {
      // Default to starter pack: ₹199
      amountInPaise = 19900;
      creditsToAdd = 50;
    }

    // Allow custom credits override if provided
    if (credits && Number(credits) > 0) {
      creditsToAdd = Number(credits);
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          userId: String(userId || 'guest'),
          userEmail: String(userEmail || ''),
          credits: Number(creditsToAdd),
          packType: packType || (amountInPaise >= 49900 ? 'pro' : 'starter')
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Razorpay orders API error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      ...data,
      keyId,
      amount: amountInPaise,
      credits: creditsToAdd
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: err.message });
  }
}
