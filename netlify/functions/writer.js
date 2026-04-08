const Anthropic = require("@anthropic-ai/sdk");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { topic, category, angle } = JSON.parse(event.body);

    const client = new Anthropic();
    const prompt = `Write a blog post for DivorceAngels.com about: "${topic}"

Category: ${category}
${angle ? `Tone/angle: ${angle}` : ''}

Requirements:
- Write in a warm, empathetic tone like a knowledgeable friend who has been through it
- 500-700 words
- Include a compelling intro that hooks the reader
- Use subheadings (## for H2) to break up the content
- Include practical, actionable tips
- End with an encouraging, hopeful conclusion
- Format in Markdown
- Do not include a title at the top (the CMS handles that)
- Do not be preachy or overly clinical
- Write for someone in the middle of or about to start a divorce in Canada or the US`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: message.content[0].text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
