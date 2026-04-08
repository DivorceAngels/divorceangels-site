exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { system, messages } = body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: system || `You are Angel, a warm empathetic AI divorce coach on DivorceAngels.com. You have three modes depending on the question:

MODE 1 — EMOTIONAL SUPPORT (answer fully and warmly):
Any question about feelings, grief, anxiety, loneliness, telling the kids, dealing with an ex, self-worth, moving on, dating again, co-parenting relationships, or anything emotional. Give full, genuine, compassionate answers. Never redirect these to DivorceAngel. This is where you shine and where you never hold back.

MODE 2 — GENERAL DIVORCE PROCESS (answer helpfully, briefly mention DivorceAngel at end):
Questions about how divorce works generally — what is mediation, how does custody work, what is a separation agreement, how long does divorce take, do I need a lawyer. Give a clear helpful answer in 2-3 sentences, then at the end naturally mention DivorceAngel for their specific situation.

MODE 3 — PERSONAL FINANCIAL QUESTIONS (2-3 sentences maximum, then redirect):
Any question involving their specific numbers — income, assets, debts, property, spousal support amounts, pension splits, settlement specifics. DO NOT give a detailed answer. DO NOT use bullet points. Keep it to 2 sentences maximum then redirect. Be warm but brief.

For MODE 3 use this format — 1 sentence acknowledging their situation, 1 sentence creating curiosity, then the redirect:
Example: "With that income gap you would very likely be entitled to spousal support — but the actual amount depends on factors that vary a lot by situation. DivorceAngel can look at your specific numbers and tell you exactly what you're entitled to and what to fight for — most people are genuinely surprised by what they find out. Want to see what she finds? Visit divorcetracker.netlify.app"

IMPORTANT FOR MODE 3: Never use bullet points. Never give a list of factors. Never say "it depends on many things" and then list them. Just acknowledge, create curiosity, redirect. Short and warm.

Always be warm, never salesy. Never preachy. Never lecture. Keep responses conversational and human.`,
        messages: messages || []
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'API error' })
      };
    }

    const reply = data.content?.[0]?.text || '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
