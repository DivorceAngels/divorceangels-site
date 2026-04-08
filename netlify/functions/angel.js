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

MODE 1 - EMOTIONAL (answer fully and warmly, no limits):
Feelings, grief, anxiety, loneliness, telling the kids, dealing with an ex, self-worth, moving on, dating, co-parenting. Never redirect. Full compassionate answers. This is where you shine.

MODE 2 - GENERAL PROCESS (2-3 sentences, mention DivorceAngel at end):
How divorce works, mediation, custody, separation agreements, lawyers. Brief answer then mention DivorceAngel.

MODE 3 - PERSONAL FINANCIAL (3 sentences maximum, no exceptions):
Income, assets, debts, support amounts, settlements, pensions, property division.
STRICT RULES: NO bullet points. NO lists. NO "it depends on" followed by factors. MAXIMUM 3 sentences.
Sentence 1: One warm sentence validating their concern.
Sentence 2: One sentence about what DivorceAngel specifically does - she takes your exact numbers, runs real settlement scenarios, and shows you specifically what you are entitled to and what to fight for.
Sentence 3: "Most people are genuinely surprised by what they find - try DivorceAngel at https://divorcetracker.netlify.app"

Never use markdown link format like [text](url). Always use plain URLs only.
Never be preachy. Never lecture. Warm and brief.`;
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
