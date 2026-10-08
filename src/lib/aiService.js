import { supabase, getEffectiveCredits, deductCredit } from './supabase.js';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';

/**
 * Strips markdown asterisks, hashes, and backticks so social text is clean, authentic plain text
 */
function cleanSocialText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')     // remove **bold**
    .replace(/\*(.*?)\*/g, '$1')         // remove *italic*
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // remove __underline__
    .replace(/^#+\s+/gm, '')             // remove markdown headers # Header
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // remove backticks
    .replace(/^\s*[-*]\s+/gm, '• ')      // standardize bullet points to clean dots
    .trim();
}

/**
 * Resolves source content via Serverless Proxy (/api/extract-content)
 * Handles YouTube transcript extraction and Article reader mode without CORS or IP block issues.
 */
async function resolveSourceContent(content, inputType) {
  const trimmed = content.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  if (!isUrl) {
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0] || 'Content Notes';
    const words = trimmed.split(/\s+/).filter(w => w.length > 2);
    const title = firstLine.length < 80 ? firstLine.replace(/[#*`_]/g, '') : words.slice(0, 8).join(' ');

    return {
      resolvedText: trimmed,
      topicTitle: title,
      isUrl: false
    };
  }

  // Route URL through our serverless extractor to avoid browser CORS and extract spoken YouTube transcripts
  try {
    const endpoint = `/api/extract-content?url=${encodeURIComponent(trimmed)}`;
    const res = await fetch(endpoint);
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text && data.text.length > 30) {
        return {
          resolvedText: data.text,
          topicTitle: data.title || 'Source Material',
          isUrl: true
        };
      } else if (data.error === 'no_captions') {
        throw new Error(data.message || 'Captions are disabled on this video. Please switch to "Raw Text" mode and paste the transcript or notes directly.');
      } else if (data.message) {
        throw new Error(data.message);
      }
    }
  } catch (err) {
    // If it's our explicit user error, re-throw it so UI can display it
    if (err.message && (err.message.includes('Captions') || err.message.includes('Raw Text'))) {
      throw err;
    }
    console.warn('Serverless extraction warning, falling back:', err.message);
  }

  // Graceful fallback if serverless proxy is unavailable
  const parsed = new URL(trimmed);
  const segments = parsed.pathname.split('/').filter(Boolean);
  const cleanTitle = segments.length > 0 
    ? segments[segments.length - 1].replace(/-[0-9a-f]{6,}$/i, '').split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Online Source';

  return {
    resolvedText: `Source URL: ${trimmed}\nTopic: ${cleanTitle}`,
    topicTitle: cleanTitle,
    isUrl: true
  };
}

/**
 * 4 Rotating Hook Archetypes (Pillar 2: Eliminating "Same Output Every Time")
 * Prevents repetitive, formulaic "I spent the last 2 years..." openings.
 */
const HOOK_ARCHETYPES = [
  {
    id: 'contrarian',
    instruction: 'THE CONTRARIAN OPENER: Start by challenging a widely accepted industry consensus with an uncomfortable reality directly derived from the source facts. No personal melodrama. Make the reader pause.'
  },
  {
    id: 'architectural_metric',
    instruction: 'THE METRIC / ARCHITECTURE OPENER: Lead with a high-stakes benchmark, production trade-off, dollar figure, or concrete technical comparison extracted from the material. Establish immediate practitioner credibility.'
  },
  {
    id: 'field_observation',
    instruction: 'THE FIELD NOTE OPENER: Open with an authentic, grounded observation from the engineering or product trenches. Cut through hype and focus on what actually breaks or works in production.'
  },
  {
    id: 'direct_thesis',
    instruction: 'THE DIRECT THESIS OPENER: Jump straight into the core operational principle without preamble. State the single most valuable mental model or takeaway in 1-2 punchy sentences.'
  }
];

/**
 * Modular Tone Prompts (Pillar 3: Real Tone Differentiation)
 * Each tone receives its own distinct persona and structural constraints.
 */
const TONE_ENGINES = {
  'contrarian': {
    temperature: 0.85,
    systemAddon: `TONE DIRECTIVE: CONTRARIAN & UNCONVENTIONAL
- Constraint: ZERO personal vulnerability or storytelling.
- Mechanics: Expose a flawed industry consensus $\\rightarrow$ Present the real-world counter-evidence from the source $\\rightarrow$ Deliver the counter-intuitive mental model.
- Pacing: Sharp, critical, and authoritative.`
  },
  'punchy': {
    temperature: 0.85,
    systemAddon: `TONE DIRECTIVE: PUNCHY & HIGH-DENSITY
- Constraint: Maximum 15 words per paragraph. One distinct insight per line.
- Mechanics: Staccato rhythm, zero transition fluff ("In conclusion", "Ultimately", "At the end of the day"). Bullet points only.
- Pacing: Rapid-fire, dense signal, zero filler words.`
  },
  'storytelling': {
    temperature: 0.85,
    systemAddon: `TONE DIRECTIVE: HUMAN TRANSFORMATION & NARRATIVE
- Constraint: Authentic, grounded journey without corporate clichés.
- Mechanics: Real production friction $\\rightarrow$ The turning point testing $\\rightarrow$ Concrete mechanics learned.
- Pacing: Natural narrative flow with whitespace and pacing.`
  },
  'technical': {
    temperature: 0.70,
    systemAddon: `TONE DIRECTIVE: DEEP TECHNICAL & ANALYTICAL
- Constraint: Focus on architecture, latency, memory bottlenecks, stack trade-offs, code/system mechanics, and concrete benchmarks.
- Mechanics: System diagram in text $\\rightarrow$ Core trade-offs $\\rightarrow$ Production recommendation.
- Pacing: Practitioner-to-practitioner engineering rigor.`
  },
  'thought-leader': {
    temperature: 0.70,
    systemAddon: `TONE DIRECTIVE: MACRO THOUGHT LEADERSHIP
- Constraint: Synthesizes the macro architectural and market trends of the next 2-3 years.
- Mechanics: Strategic clarity, industry shift analysis, high-leverage frameworks.
- Pacing: Executive briefing style without buzzword soup.`
  }
};

/**
 * Universal Groq Chat Completion caller
 * Target active, verified free-tier models on Groq: openai/gpt-oss-120b, qwen/qwen3.8-27b, openai/gpt-oss-20b
 */
async function callGroqApi(systemPrompt, userPrompt, key, temperature = 0.80) {
  const cleanKey = key.trim();
  const models = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b'
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: temperature,
          top_p: 0.9,
          frequency_penalty: 0.2,
          max_tokens: 4096
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleanJson = content
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          return JSON.parse(cleanJson);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.warn(`Groq [${model}] note (${response.status}):`, errMsg);
        lastError = new Error(`[${model}] ${errMsg}`);
        if (response.status === 429 || response.status === 404 || response.status >= 500) {
          continue;
        }
      }
    } catch (fetchErr) {
      console.warn(`Groq fetch error for ${model}:`, fetchErr.message);
      lastError = fetchErr;
    }
  }

  throw lastError || new Error('Groq API was unable to generate content across available models.');
}

/**
 * Main Content Repurposing function using Groq
 */
export async function repurposeContent({ userId, content, inputType, tone = 'thought-leader' }) {
  if (!content || !content.trim()) {
    throw new Error('Please provide source content or a link to repurpose.');
  }

  // 1. Resolve source content via serverless proxy
  const { resolvedText, topicTitle } = await resolveSourceContent(content, inputType);

  // 2. Check user credits (from Supabase profile or persistent guest storage)
  const currentCredits = await getEffectiveCredits(userId);
  if (currentCredits <= 0) {
    throw new Error('Insufficient credits. You have 0 credits remaining. Please upgrade to Pro to continue morphing.');
  }

  // 3. Select Hook Archetype randomly to avoid repetitive output patterns
  const chosenArchetype = HOOK_ARCHETYPES[Math.floor(Math.random() * HOOK_ARCHETYPES.length)];
  const toneConfig = TONE_ENGINES[tone] || TONE_ENGINES['thought-leader'];

  // 4. Construct Master Viral Copywriting Engine Prompt
  const systemPrompt = `You are a master viral ghostwriter for elite tech founders, practitioners, and executives.
Your posts stand out because you write like an authentic practitioner with deep domain knowledge, NOT a generic AI.

NEGATIVE CONSTRAINTS (STRICTLY BANNED):
- NEVER use: "Picture this", "The room fell silent", "A sleepless night of tinkering", "Coffee-stained notes", "In a world where", "Game-changer", "Paradigm shift", "Democratized", "At warp speed", "Delve", "Testament", "Beacon", "Look no further".
- NEVER open with a generic rhetorical question ("Have you ever wondered...?").
- NEVER use markdown bold (**word**), italics (*word*), or headers (#) in social outputs. Use plain text only.
- NEVER use rocket or fire emojis. Maximum 1-2 subtle emojis or zero.

${toneConfig.systemAddon}

You MUST return strictly valid JSON matching the requested schema.`;

  const userPrompt = `TOPIC: "${topicTitle}"

SOURCE MATERIAL:
"""
${resolvedText}
"""

STRUCTURAL INSTRUCTIONS:
- Apply this hook style: ${chosenArchetype.instruction}
- Do NOT use the exact phrase "I spent the last 2 years". Create a unique, topic-native hook.
- Ground every claim in the actual facts, figures, and technical points from the source material.

OUTPUT FORMAT (STRICT JSON):
{
  "linkedin_post": "A clean, high-signal, human-sounding LinkedIn post (strictly plain text, NO asterisks or markdown bolding) with natural whitespace pacing, 2-3 bullet insights (•), and 3-4 relevant hashtags.",
  "twitter_thread": [
    "Tweet 1 (Viral scroll-stopping hook with curiosity gap)",
    "Tweet 2 (The friction / context)",
    "Tweet 3 (Deep-dive insight #1)",
    "Tweet 4 (Deep-dive insight #2)",
    "Tweet 5 (Actionable takeaway)",
    "Tweet 6 (Wrap-up & bookmark CTA)"
  ],
  "newsletter_blurb": "A crisp, high-signal 200-300 word newsletter section with an editorial headline, key technical synthesis, and bulleted takeaways."
}`;

  // 5. Execute Groq Generation via Serverless /api/repurpose (Keeps GROQ_API_KEY 100% secret on server)
  let parsedOutput = null;

  try {
    const apiRes = await fetch('/api/repurpose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolvedText,
        topicTitle,
        tone
      })
    });

    if (apiRes.ok) {
      parsedOutput = await apiRes.json();
    } else {
      const errJson = await apiRes.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${apiRes.status}: Generation failed.`);
    }
  } catch (apiErr) {
    // If serverless is unreachable (e.g. offline dev) and local VITE_GROQ_API_KEY is present
    if (groqApiKey && groqApiKey.length > 10 && !groqApiKey.includes('YOUR_')) {
      try {
        parsedOutput = await callGroqApi(systemPrompt, userPrompt, groqApiKey, toneConfig.temperature);
      } catch (clientErr) {
        throw new Error(`Groq API Error: ${clientErr.message}`);
      }
    } else {
      throw apiErr;
    }
  }

  if (!parsedOutput || !parsedOutput.linkedin_post) {
    throw new Error('Content generation did not return the expected format from Groq.');
  }

  // 6. Clean any residual markdown formatting
  if (parsedOutput.linkedin_post) {
    parsedOutput.linkedin_post = cleanSocialText(parsedOutput.linkedin_post);
  }
  if (Array.isArray(parsedOutput.twitter_thread)) {
    parsedOutput.twitter_thread = parsedOutput.twitter_thread.map(t => cleanSocialText(t));
  }

  // 7. Save to Supabase 'repurposed_posts'
  let savedPostId = null;
  if (userId) {
    try {
      const { data: savedPost, error: insertError } = await supabase
        .from('repurposed_posts')
        .insert([
          {
            user_id: userId,
            input_type: inputType,
            original_snippet: (topicTitle + ' - ' + content).substring(0, 150),
            tone: tone,
            linkedin_post: parsedOutput.linkedin_post,
            twitter_thread: parsedOutput.twitter_thread,
            newsletter_blurb: parsedOutput.newsletter_blurb,
          },
        ])
        .select()
        .single();

      if (!insertError && savedPost) {
        savedPostId = savedPost.id;
      }
    } catch (saveErr) {
      console.warn('Supabase insert warning:', saveErr);
    }
  }

  // 8. Deduct credit persistently
  const remainingCredits = await deductCredit(userId);

  return {
    ...parsedOutput,
    linkedin: parsedOutput.linkedin_post,
    twitter: Array.isArray(parsedOutput.twitter_thread) ? parsedOutput.twitter_thread.join('\n\n') : (parsedOutput.twitter_thread || ''),
    newsletter: parsedOutput.newsletter_blurb,
    remainingCredits,
    id: savedPostId || `post-${Date.now()}`
  };
}
