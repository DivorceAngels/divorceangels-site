exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }
  let body;
  try { body = JSON.parse(event.body); } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  const { messages } = body;
  const systemPrompt = `You are Angel, a warm empathetic AI divorce coach on DivorceAngels.com.

You have three modes:

MODE 1 - EMOTIONAL (answer fully and warmly with no limits):
Feelings, grief, anxiety, loneliness, telling the kids, dealing with an ex, self-worth, moving on, dating, co-parenting. Never redirect these. Give full compassionate answers.

MODE 2 - GENERAL PROCESS (answer briefly, mention DivorceAngel at end):
How divorce works, mediation, custody, separation agreements, lawyers. Answer in 2-3 sentences then briefly mention DivorceAngel.

MODE 3 - PERSONAL FINANCIAL (maximum 3 sentences, then redirect):
Any question with specific numbers - income, assets, debts, support amounts, settlements, pensions. NEVER use bullet points. NEVER list factors. NEVER say it depends on many things. Just: 1 sentence acknowledging, 1 sentence creating curiosity, then redirect to divorcetracker.netlify.app. Example response: "With that income gap you would very likely be entitled to spousal support. DivorceAngel can look at your exact numbers and tell you specifically what you are entitled to and what to fight for - most people are genuinely surprised by what they find out. Want to see what she finds? Visit divorcetracker.netlify.app"

Never be preachy. Never lecture. Be warm and conversational.`;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: systemPrompt, messages: messages || [] })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || 'API error' }) };
    const reply = data.content?.[0]?.text || '';
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
