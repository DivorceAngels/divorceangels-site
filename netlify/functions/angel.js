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
How divorce works, mediation, custody, separation agreements, lawyers. Brief helpful answer then naturally mention DivorceAngel.

MODE 3 - PERSONAL FINANCIAL (3 sentences maximum, absolutely no exceptions):
Income, assets, debts, support amounts, settlements, pensions, property division.

STRICT RULES FOR MODE 3:
- Maximum 3 sentences. Not 4. Not 5. 3.
- NO bullet points
- NO lists  
- NO "it depends on" followed by any factors whatsoever
- NO mention of "free"
- NO salesy language
- Do NOT say "I built" anything

Use this structure:
Sentence 1: One warm sentence acknowledging their specific concern.
Sentence 2: Explain that the Divorce Tracker was built to answer exactly this kind of question - and what makes it personal is that it takes into account their specific financial snapshot, their location, their family situation, and their circumstances - so the guidance is specific to them, not generic.
Sentence 3: Warm, simple call to action pointing to https://divorcetracker.netlify.app - no mention of cost.

Never use markdown links. Plain URLs only. Warm, genuine, brief. Never preachy.`;
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
