// Runs automatically after every successful Netlify deploy (event-triggered function).
// On production deploys it tells IndexNow (Bing, Yandex, Seznam, Naver and others) which
// pages changed, so they are recrawled within hours instead of weeks.
// Bing's index feeds ChatGPT search, so this is how new pages reach ChatGPT fastest.

const SITE = 'https://thedivorceangels.com';
const KEY = '57e7fb981d111560e2529204fdfefe0b';

exports.handler = async function (event) {
  let payload = {};
  try { payload = JSON.parse(event.body || '{}').payload || {}; } catch (e) {}

  if (payload.context && payload.context !== 'production') {
    return { statusCode: 200, body: 'Not a production deploy, IndexNow skipped' };
  }

  let urls = [SITE + '/'];
  try {
    const res = await fetch(`${SITE}/indexnow-urls.json?d=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.urls) && data.urls.length) urls = data.urls;
    }
  } catch (e) {
    console.log('IndexNow: could not read indexnow-urls.json, sending the homepage only');
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'thedivorceangels.com',
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  console.log(`IndexNow: submitted ${urls.length} URL(s), response ${res.status}`);
  return { statusCode: 200, body: `IndexNow ${res.status}: ${urls.length} URL(s)` };
};
