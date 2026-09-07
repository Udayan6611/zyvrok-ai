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
 * Resolves source content from raw text, article URLs, or YouTube links
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

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    let ytTitle = '';
    let author = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          ytTitle = data.title;
          author = data.author_name || '';
        }
      }
    } catch (e) {
      console.warn('YouTube lookup note:', e.message);
    }

    const title = ytTitle || `YouTube Video (${videoId})`;

    return {
      resolvedText: `Source YouTube Video Title: "${title}"\nChannel / Creator: ${author || 'Video Creator'}\nURL: https://www.youtube.com/watch?v=${videoId}`,
      topicTitle: title,
      isUrl: true
    };
  }

  let cleanTitle = 'Article Summary';
  let fetchedBody = '';

  try {
    const parsed = new URL(trimmed);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      const stripped = last.replace(/-[0-9a-f]{6,}$/i, '');
      const words = stripped.split(/[-_]/).filter(Boolean);
      cleanTitle = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  } catch (e) {
    console.warn('URL parsing note:', e);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);
    const readerUrl = `https://r.jina.ai/${trimmed}`;
    const res = await fetch(readerUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 100) {
        const cleanLines = text.split('\n').filter(line => {
          const l = line.trim();
          return !(
            l.startsWith('Title:') ||
            l.startsWith('URL Source:') ||
            l.startsWith('Published Time:') ||
            l.startsWith('Markdown Content:') ||
            l.startsWith('Author:') ||
            l.startsWith('Article Title:')
          );
        });

        const h1Match = text.match(/^#\s+(.+)$/m);
        if (h1Match && h1Match[1]) {
          cleanTitle = h1Match[1].trim();
        }

        fetchedBody = cleanLines.join('\n').trim().slice(0, 12000);
      }
    }
  } catch (e) {
    console.warn('Article reader fetch note:', e.message);
  }

  return {
    resolvedText: fetchedBody ? `Topic / Title: ${cleanTitle}\n\nArticle Content:\n${fetchedBody}` : `Article Title: ${cleanTitle}\nSource URL: ${trimmed}`,
    topicTitle: cleanTitle,
    isUrl: true
  };
}

/**
 * Universal Groq Chat Completion caller
 */
async function callGroqApi(systemPrompt, userPrompt, key) {
  const cleanKey = key.trim();
  const models = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile'];
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
          temperature: 0.85,
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
        console.warn(`Groq [${model}] failed (${response.status}):`, errMsg);
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
export async function repurposeContent({ userId, content, inputType, tone }) {
  if (!content || !content.trim()) {
    throw new Error('Please provide source content or a link to repurpose.');
  }

  // 1. Resolve source content
  const { resolvedText, topicTitle } = await resolveSourceContent(content, inputType);

  // 2. Check user credits (from Supabase profile or persistent guest storage)
  const currentCredits = await getEffectiveCredits(userId);
  if (currentCredits <= 0) {
    throw new Error('Insufficient credits. You have 0 credits remaining. Please upgrade to Pro to continue morphing.');
  }

  // 3. Master Viral Copywriting Engine (Grounded in top viral creator frameworks: Justin Welsh, Jasmin Alić, Shaan Puri)
  const systemPrompt = `You are a master viral tech ghostwriter for elite founders, developers, and tech executives.
Your posts routinely get hundreds of reposts and thousands of comments because you write like a genuine human practitioner, NOT a generic AI.

You understand the psychological mechanics of viral LinkedIn posts:
1. THE HOOK: The first 1-2 lines must create an intense curiosity gap, admit an honest vulnerability/struggle, or present a sharp contrast BEFORE the reader clicks "...see more".
2. THE PACING: Never rush through ideas. Never write a generic summary or datasheet. Use short 1-2 sentence paragraphs with whitespace. Rhythmic, punchy reading flow.
3. AUTHENTIC FRICTION: Real builders talk about real trade-offs—cloud bills eating margins, latency killing UX, GPU memory bottlenecks, architecture mistakes.
4. ZERO AI CLICHÉS: Never use "Picture this", "The room fell silent", "A sleepless night of tinkering", "Coffee-stained notes", "In a world where", "Game-changer", "Paradigm shift", "Democratized", "At warp speed", "Delve", "Testament", "Beacon", "Look no further".
5. ZERO MARKDOWN: LinkedIn and Twitter DO NOT support Markdown. Never use **bold**, *italics*, or # headers in social posts.

You MUST output strictly valid JSON adhering to the requested schema.`;

  const userPrompt = `TOPIC: "${topicTitle}"

SOURCE MATERIAL:
"""
${resolvedText}
"""

TARGET TONE: "${tone}"

=======================================================
PROVEN VIRAL POST BLUEPRINT (FOLLOW STEP-BY-STEP):
=======================================================

FOR LINKEDIN POST (160 - 240 words):
- ACT 1 (THE HOOK - Lines 1-2, under 180 chars): Open with an honest admission, bold contrast, or surprising realization. (e.g. "I spent the last 2 years convinced that X was a hobbyist trap.", "Everyone tells developers to do X. In production, it almost broke our stack.")
- ACT 2 (THE FRICTION): 2-3 short lines explaining the struggle or the status quo problem (costs, latency, broken tooling, developer friction).
- ACT 3 (THE SHIFT): The moment of testing or discovery from the source content. Make the realization feel earned, not rushed.
- ACT 4 (THE CORE MECHANICS): 2-3 clean bullet points (using • symbol only) detailing the actual technical breakdown or tactical insights from "${topicTitle}".
- ACT 5 (THE PUNCHLINE): A sharp, memorable 1-2 sentence realization about where the industry is heading.
- ACT 6 (THE CONVERSATION STARTER): An open-ended question that makes practitioners want to leave a comment.
- HASHTAGS: 3 to 4 hyper-relevant tech tags at the very bottom.

TONE SPECIFICATIONS:
- "storytelling": Follow the 5-part transformation arc (Old belief -> Real friction -> The test/discovery -> Concrete mechanics -> Memorable punchline). Grounded, paced, human, engaging.
- "conversational": Casual, candid, peer-to-peer reflection. Like a founder or senior engineer sharing an honest discovery with smart friends over coffee.
- "contrarian": Unpopular opinion that challenges conventional wisdom using real technical facts from the source.
- "punchy": High-velocity, staccato, 1-idea per line. Maximum signal density, zero fluff.
- "thought leader": Synthesizes the macro architectural trend of the next 2-3 years.
- "professional": Polished, executive briefing on operational impact without corporate buzzwords.

FOR TWITTER / X THREAD:
- 5 to 6 modular tweets.
- Tweet 1: Pure viral hook with curiosity gap, ending in 🧵👇.
- Tweets 2-5: Sharp, high-signal observations with line breaks. NO asterisks (**).
- Tweet 6: Punchline, bookmark/repost prompt, and open question.

FOR NEWSLETTER SNIPPET:
- 200-300 words with a witty/editorial headline.
- Deep-dive context and a formatted "💡 Key Takeaways" section.

OUTPUT JSON SCHEMA:
{
  "linkedin_post": "A clean, humanized, viral LinkedIn post (strictly plain text, NO asterisks or markdown bolding) with natural line breaks, visual pacing, 2-3 bullet insights (•), and relevant hashtags.",
  "twitter_thread": [
    "Tweet 1 (Viral scroll-stopping hook with 🧵👇)",
    "Tweet 2 (The friction / context)",
    "Tweet 3 (Deep-dive insight #1)",
    "Tweet 4 (Deep-dive insight #2)",
    "Tweet 5 (Actionable takeaway)",
    "Tweet 6 (Wrap-up & bookmark CTA)"
  ],
  "newsletter_blurb": "A crisp, witty 200-300 word newsletter section with a sharp editorial headline, deep-dive synthesis, and a formatted '💡 Key Takeaways' section."
}

CRITICAL:
- Extract and use the real facts, numbers, and architecture from "${topicTitle}".
- Do NOT rush the narrative.
- Return ONLY valid JSON matching the schema.`;

  // 4. Execute Groq API Call
  let parsedOutput = null;

  if (groqApiKey && groqApiKey.length > 10 && !groqApiKey.includes('YOUR_')) {
    try {
      parsedOutput = await callGroqApi(systemPrompt, userPrompt, groqApiKey);
    } catch (err) {
      console.error('Groq API execution error:', err);
      throw new Error(`Groq API Error: ${err.message}`);
    }
  } else {
    throw new Error('Please configure your VITE_GROQ_API_KEY in your .env file.');
  }

  if (!parsedOutput || !parsedOutput.linkedin_post) {
    throw new Error('Content generation did not return the expected format from Groq.');
  }

  // 5. Sanitize any accidental markdown formatting in social outputs
  if (parsedOutput.linkedin_post) {
    parsedOutput.linkedin_post = cleanSocialText(parsedOutput.linkedin_post);
  }
  if (Array.isArray(parsedOutput.twitter_thread)) {
    parsedOutput.twitter_thread = parsedOutput.twitter_thread.map(t => cleanSocialText(t));
  }

  // 6. Save to Supabase 'repurposed_posts'
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

  // 7. Deduct credit persistently (in Supabase profile or guest storage)
  const remainingCredits = await deductCredit(userId);

  return {
    ...parsedOutput,
    remainingCredits,
    id: savedPostId || `post-${Date.now()}`
  };
}
