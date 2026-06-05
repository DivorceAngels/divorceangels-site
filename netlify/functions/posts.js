const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'DivorceAngels/divorceangels-site';
const BRANCH = 'main';

exports.handler = async function() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`,
    { headers: { 'Authorization': `token ${TOKEN}` } }
  );
  const data = await res.json();
  const files = data.tree
    .filter(f => f.path.startsWith('_posts/') && f.path.endsWith('.md') && /^\d{4}-\d{2}-\d{2}-/.test(f.path.split('/').pop()))
    .sort((a,b) => b.path.localeCompare(a.path))
    .slice(0, 9)
    .map(f => f.path);

  const posts = await Promise.all(files.map(async path => {
    const raw = await fetch(`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`, { headers: { 'Authorization': `token ${TOKEN}` } });
    const text = await raw.text();
    const fm = {};
    const m = text.match(/^---\n([\s\S]*?)\n---/);
    if (m) m[1].split('\n').forEach(line => { const i = line.indexOf(':'); if (i > -1) fm[line.slice(0,i).trim()] = line.slice(i+1).trim().replace(/^["']|["']$/g,''); });
    const filename = path.split('/').pop();
    return { slug: filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''), title: fm.title || filename, date: fm.date || '', category: fm.category || '', cover_image: fm.cover_image || '' };
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(posts)
  };
};
