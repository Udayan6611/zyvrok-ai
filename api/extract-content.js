/**
 * Vercel Serverless Function: Content & Transcript Extraction Proxy
 * Handles YouTube transcript extraction and Article reader mode without browser CORS restrictions.
 */

// Simple XML entity decoder
function decodeXml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

// Extracts YouTube video ID from various URL patterns
function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

// Attempts to extract transcript from a YouTube video
async function getYouTubeTranscript(videoId) {
  let title = `YouTube Video (${videoId})`;
  let channel = '';

  // 1. Fetch title and author via oEmbed
  try {
    const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      if (data.title) title = data.title;
      if (data.author_name) channel = data.author_name;
    }
  } catch (e) {
    console.warn('oEmbed fetch error:', e.message);
  }

  // 2. Fetch video page HTML to locate caption tracks
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Look for ytInitialPlayerResponse
      const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
      if (playerMatch && playerMatch[1]) {
        try {
          const playerData = JSON.parse(playerMatch[1]);
          const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

          if (Array.isArray(captionTracks) && captionTracks.length > 0) {
            // Find English track or fall back to the first available track
            const enTrack = captionTracks.find(t => t.languageCode === 'en' || (t.vssId && t.vssId.includes('.en'))) || captionTracks[0];

            if (enTrack && enTrack.baseUrl) {
              const transcriptRes = await fetch(enTrack.baseUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
              });

              if (transcriptRes.ok) {
                const xmlText = await transcriptRes.text();
                // Match <text ...>words</text>
                const matches = [...xmlText.matchAll(/<text[^>]*>(.*?)<\/text>/gs)];
                if (matches.length > 0) {
                  const fullTranscript = matches
                    .map(m => decodeXml(m[1].replace(/<[^>]+>/g, '').trim()))
                    .filter(Boolean)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                  if (fullTranscript.length > 50) {
                    return {
                      success: true,
                      title,
                      channel,
                      text: fullTranscript.slice(0, 15000),
                      type: 'youtube'
                    };
                  }
                }
              }
            }
          }
        } catch (parseErr) {
          console.warn('Failed to parse player response JSON:', parseErr.message);
        }
      }
    }
  } catch (pageErr) {
    console.warn('Error fetching YouTube page:', pageErr.message);
  }

  // If captions could not be automatically retrieved
  return {
    success: false,
    error: 'no_captions',
    title,
    channel,
    message: `Could not automatically extract spoken captions for "${title}". The creator may have disabled captions or automated subtitles. Please switch to "Raw Text" mode in Studio and paste the transcript or notes directly.`
  };
}

// Extracts clean article text via Jina Reader (server-side, no CORS)
async function getArticleContent(targetUrl) {
  let title = 'Article';
  try {
    const parsed = new URL(targetUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1].replace(/-[0-9a-f]{6,}$/i, '');
      title = last.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  } catch (e) {}

  try {
    const readerRes = await fetch(`https://r.jina.ai/${encodeURI(targetUrl)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZyvrokBot/1.0)',
        'Accept': 'text/plain'
      }
    });

    if (readerRes.ok) {
      const text = await readerRes.text();
      if (text && text.length > 100) {
        // Extract title if present as H1
        const h1 = text.match(/^#\s+(.+)$/m);
        if (h1 && h1[1]) title = h1[1].trim();

        // Strip boilerplate metadata lines
        const cleanLines = text.split('\n').filter(line => {
          const l = line.trim();
          return !(
            l.startsWith('Title:') ||
            l.startsWith('URL Source:') ||
            l.startsWith('Published Time:') ||
            l.startsWith('Markdown Content:') ||
            l.startsWith('Author:')
          );
        });

        const cleanText = cleanLines.join('\n').trim().slice(0, 12000);
        return {
          success: true,
          title,
          text: cleanText,
          type: 'article'
        };
      }
    }
  } catch (err) {
    console.warn('Jina reader error:', err.message);
  }

  return {
    success: false,
    error: 'fetch_failed',
    title,
    message: `Unable to read article content from ${targetUrl}. Please copy and paste the article text into "Raw Text" mode.`
  };
}

export default async function handler(req, res) {
  // Enable CORS for frontend API calls
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = (req.query.url || req.body?.url || '').trim();

  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'missing_url', message: 'No URL provided.' });
  }

  try {
    const ytId = extractYouTubeId(targetUrl);
    if (ytId) {
      const ytResult = await getYouTubeTranscript(ytId);
      return res.status(200).json(ytResult);
    }

    const articleResult = await getArticleContent(targetUrl);
    return res.status(200).json(articleResult);
  } catch (err) {
    console.error('Extraction error:', err);
    return res.status(500).json({ success: false, error: 'server_error', message: err.message });
  }
}
