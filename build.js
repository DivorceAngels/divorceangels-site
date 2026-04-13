const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = './_posts';
const POOL = [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1484665754804-74b091211472?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1545239705-1564e58b9e4a?w=800&q=80&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&fit=crop',
];

const TAG_COLORS = {
    'Legal':        'background:#EAF0EC;color:#2C3E35',
    'Financial':    'background:#EEF5E8;color:#2E6B27',
    'Co-Parenting': 'background:#E8EEFF;color:#2D4A6B',
    'Life After':   'background:#EDE5E0;color:#6B4A3A',
    'Emotional':    'background:#EDE8F8;color:#5240A8',
    'Wellness':     'background:#FFF0E8;color:#7A3D18',
};

function tag(category, fs='0.66rem', pad='4px 10px') {
    const style = TAG_COLORS[category] || 'background:#eee;color:#333';
    return `<span style="display:inline-block;font-size:${fs};font-weight:600;letter-spacing:0.07em;padding:${pad};border-radius:4px;${style}">${category.toUpperCase()}</span>`;
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) { return dateStr; }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const SHARED_CSS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" rel="stylesheet">
<style>
:root{--g0:#EDF4F8;--g1:#CFE6F3;--g2:#9DCBE4;--g4:#6FAACB;--g5:#1A3A4F;--blue:#4a7fa5;--ink:#1A2A35;--ink-m:#2A4A5F;--ink-l:#6A8A9F;--bdr:#D5E8F0}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Cormorant Garamond',Georgia,serif;background:#fff;color:var(--ink);font-size:18px;line-height:1.8;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{text-decoration:none;color:inherit}
h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;line-height:1.2}
p{color:var(--ink-m);line-height:1.75}
.container{max-width:1160px;margin:0 auto;padding:0 52px}
nav{position:sticky;top:0;z-index:100;background:white;border-bottom:1px solid #EDF4F8;}
.nav-inner{display:flex;align-items:center;justify-content:center;height:96px;max-width:1160px;margin:0 auto;padding:0 52px;position:relative;}
.nav-logo{display:flex;align-items:center;}.nav-links{display:flex;align-items:center;gap:32px;list-style:none}
.nav-links a{font-size:13px;color:#6A8A9F;transition:color .2s}.nav-links a:hover{color:#1A3A4F;font-weight:500}
.nav-cta{font-size:13px;font-weight:500;background:#6FAACB;color:white;padding:10px 22px;border-radius:8px;white-space:nowrap;position:absolute;right:52px;}
#menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--ink);font-size:1.3rem}
#mobile-nav{display:none;position:fixed;top:70px;left:0;right:0;background:var(--g0);border-bottom:1px solid var(--bdr);z-index:99;flex-direction:column;padding:20px 28px;gap:16px}
#mobile-nav a{font-size:0.95rem;font-weight:500;color:var(--ink)}
footer{background:var(--blue);padding:68px 0 32px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:56px;margin-bottom:48px}
.footer-brand{font-family:'DM Serif Display',serif;font-size:1.3rem;color:white;margin-bottom:12px}
.footer-brand span{color:var(--g2)}.footer-tag{font-size:0.83rem;color:rgba(255,255,255,0.42);line-height:1.65;max-width:260px;margin-bottom:22px}
.footer-socials{display:flex;gap:9px}.social-btn{width:35px;height:35px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.55);font-size:0.8rem;font-weight:600;display:flex;align-items:center;justify-content:center}
.footer-col-title{font-size:0.7rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:16px}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:11px}.footer-links a{font-size:0.84rem;color:rgba(255,255,255,0.55)}.footer-links a:hover{color:white}
.footer-bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.footer-bottom-txt{font-size:0.74rem;color:rgba(255,255,255,0.3)}
@media(max-width:860px){.container{padding:0 28px}.nav-inner{padding:0 28px}.nav-links{display:none}#menu-btn{display:block}.footer-grid{grid-template-columns:1fr 1fr;gap:32px}}
@media(max-width:600px){.footer-grid{grid-template-columns:1fr}}
</style>`;

const NAV = `<nav id="navbar">
  <div class="nav-inner">
    <a href="/" class="nav-logo"><img src="/logo.jpg" alt="DivorceAngels" style="height:48px;width:auto;display:block;mix-blend-mode:multiply;"></a>
    <ul class="nav-links">
      <li><a href="https://divorcetracker.netlify.app">DivorceAngel</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/toolkit/">Toolkit</a></li>
      <li><a href="/community/">Community</a></li>
    </ul>
    <div style="display:flex;align-items:center;gap:12px;">
      <button id="menu-btn">☰</button>
      <a href="https://divorcetracker.netlify.app" class="nav-cta">Get started →</a>
    </div>
  </div>
</nav>
<div id="mobile-nav">
  <a href="https://divorcetracker.netlify.app">DivorceAngel</a>
  <a href="/blog/">Blog</a>
  <a href="/toolkit/">Toolkit</a>
  <a href="/community/">Community</a>
</div>

<div id="angel-float-btn" onclick="toggleAngelChat()" style="position:fixed;bottom:28px;right:28px;z-index:1000;background:#2D4A6B;color:white;padding:12px 22px;border-radius:50px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 24px rgba(45,74,107,.45);transition:all .2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
  <span style="width:8px;height:8px;border-radius:50%;background:#5FC87A;display:inline-block;animation:pulse 2s infinite;flex-shrink:0;"></span>
  ✦ Ask Angel
</div>
<div id="angel-float-chat" style="position:fixed;bottom:90px;right:28px;z-index:1000;width:360px;background:white;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden;border:1px solid #D8E4DC;max-height:500px;">
  <div style="background:#2D4A6B;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:50%;background:#F2F7F4;display:flex;align-items:center;justify-content:center;font-size:13px;color:#2C3E35;position:relative;">✦<div style="position:absolute;bottom:0;right:0;width:8px;height:8px;border-radius:50%;background:#5FC87A;border:2px solid #2D4A6B;"></div></div>
      <div><div style="font-size:13px;font-weight:500;color:white;">Angel</div><div style="font-size:10px;color:rgba(255,255,255,.5);">Live · Ask me anything</div></div>
    </div>
    <button onclick="toggleAngelChat()" style="background:none;border:none;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;padding:0;line-height:1;">×</button>
  </div>
  <div id="float-msgs" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#F2F7F4;max-height:320px;">
    <div style="background:white;border-radius:10px 10px 10px 3px;padding:11px 14px;font-size:12px;color:#1A2018;line-height:1.7;border:.5px solid #D8E4DC;">Hi, I&apos;m Angel. Ask me anything — the legal process, your finances, how you&apos;re feeling, or where to even start.</div>
  </div>
  <div id="float-chips" style="padding:10px 12px;display:flex;flex-wrap:wrap;gap:6px;background:#F2F7F4;border-top:1px solid #D8E4DC;">
    <button onclick="floatChip('How does mediation work?')" style="background:white;border:1px solid #D8E4DC;color:#3A4E42;font-size:11px;padding:5px 11px;border-radius:20px;cursor:pointer;font-family:inherit;">How does mediation work?</button>
    <button onclick="floatChip('What am I entitled to?')" style="background:white;border:1px solid #D8E4DC;color:#3A4E42;font-size:11px;padding:5px 11px;border-radius:20px;cursor:pointer;font-family:inherit;">What am I entitled to?</button>
    <button onclick="floatChip('I feel overwhelmed')" style="background:white;border:1px solid #D8E4DC;color:#3A4E42;font-size:11px;padding:5px 11px;border-radius:20px;cursor:pointer;font-family:inherit;">I feel overwhelmed</button>
    <button onclick="floatChip('Where do I start?')" style="background:white;border:1px solid #D8E4DC;color:#3A4E42;font-size:11px;padding:5px 11px;border-radius:20px;cursor:pointer;font-family:inherit;">Where do I start?</button>
  </div>
  <div style="padding:10px 12px;background:white;border-top:1px solid #D8E4DC;display:flex;gap:8px;">
    <input type="text" id="float-input" placeholder="Ask Angel anything..." onkeydown="if(event.key==='Enter')sendFloat()" style="flex:1;background:#F2F7F4;border:1px solid #D8E4DC;border-radius:8px;padding:8px 12px;font-size:12px;color:#1A2018;font-family:inherit;outline:none;">
    <button onclick="sendFloat()" style="background:#2D4A6B;color:white;padding:8px 14px;border-radius:8px;font-size:12px;border:none;cursor:pointer;">→</button>
  </div>
</div>
<style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}</style>
<script>
function toggleAngelChat(){const chat=document.getElementById('angel-float-chat');const isOpen=chat.style.display==='flex';chat.style.display=isOpen?'none':'flex';if(!isOpen)document.getElementById('float-input').focus();}
function floatChip(q){document.getElementById('float-chips').style.display='none';document.getElementById('float-input').value=q;sendFloat();}
async function sendFloat(){const inp=document.getElementById('float-input');const msgs=document.getElementById('float-msgs');const txt=inp.value.trim();if(!txt)return;document.getElementById('float-chips').style.display='none';const uBub=document.createElement('div');uBub.style.cssText='background:#2D4A6B;border-radius:10px 10px 3px 10px;padding:10px 13px;align-self:flex-end;max-width:85%;font-size:12px;color:white;line-height:1.65;';uBub.textContent=txt;msgs.appendChild(uBub);inp.value='';msgs.scrollTop=msgs.scrollHeight;const typing=document.createElement('div');typing.style.cssText='background:white;border-radius:10px 10px 10px 3px;padding:10px 13px;font-size:12px;color:#6A7A70;line-height:1.65;border:.5px solid #D8E4DC;';typing.textContent='Angel is thinking…';msgs.appendChild(typing);msgs.scrollTop=msgs.scrollHeight;try{const res=await fetch('/.netlify/functions/angel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:txt}]})});const data=await res.json();typing.remove();const aBub=document.createElement('div');aBub.style.cssText='background:white;border-radius:10px 10px 10px 3px;padding:10px 13px;max-width:92%;font-size:12px;color:#1A2018;line-height:1.7;border:.5px solid #D8E4DC;';const reply=(data.reply||data.content||'Something went wrong.').replace(/\[([^\]]+)\]\((https?[^)]+)\)/g,'$2');aBub.innerHTML=reply.replace(/\n/g,'<br>');msgs.appendChild(aBub);msgs.scrollTop=msgs.scrollHeight;}catch(e){typing.textContent='Something went wrong — please try again.';}}
</script>
`;

const FOOTER = `<footer>
  <div class="container">
    <div class="footer-grid">
      <div><div class="footer-brand">✦ Divorce<span>Angels</span></div><p class="footer-tag">Real guidance for real people navigating one of life's hardest transitions.</p><div class="footer-socials"><a href="#" class="social-btn">f</a><a href="#" class="social-btn">in</a><a href="#" class="social-btn">ig</a></div></div>
      <div><div class="footer-col-title">Content</div><ul class="footer-links"><li><a href="/blog/">Blog</a></li><li><a href="/#angel-section">Ask Angel</a></li></ul></div>
      <div><div class="footer-col-title">Community</div><ul class="footer-links"><li><a href="https://www.facebook.com/groups/3705373593017325" target="_blank">Facebook Group</a></li><li><a href="#">Newsletter</a></li></ul></div>
      <div><div class="footer-col-title">Tools</div><ul class="footer-links"><li><a href="https://divorcetracker.netlify.app/" target="_blank">Divorce Tracker</a></li><li><a href="/#angel-section">Angel AI</a></li></ul></div>
    </div>
    <div class="footer-bottom"><div class="footer-bottom-txt">© 2026 Divorce Angels. All rights reserved.</div><div class="footer-bottom-txt">Not legal advice. Always consult a licensed attorney.</div></div>
  </div>
</footer>
<script>document.getElementById('menu-btn').addEventListener('click',()=>{const n=document.getElementById('mobile-nav');n.style.display=n.style.display==='flex'?'none':'flex';});</script>`;

// Read all posts
const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
const posts = postFiles.map((file, idx) => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content: body } = matter(content);
    const slug = data.slug || file.replace('.md', '');
    const coverImg = data.cover_image || POOL[idx % POOL.length];
    const excerpt = data.excerpt || body.replace(/[#*`]/g, '').slice(0, 200) + '…';
    const dateFmt = formatDate(data.date);
    return { ...data, slug, cover_img: coverImg, excerpt, date_fmt: dateFmt, body, idx };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`Building ${posts.length} posts...`);

// Build individual post pages
posts.forEach((post, i) => {
    const slug = post.slug;
    if (!slug) return;
    
    const dir = `./${slug}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const htmlContent = marked(post.body || '');
    const related = posts.filter((_, j) => Math.abs(j - i) <= 2 && j !== i).slice(0, 3);
    const relHtml = related.length ? `
<div style="padding:52px 0;border-top:1px solid #D8E4DC;">
  <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.3rem;color:#1A2A35;margin-bottom:22px;">More articles</h3>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
    ${related.map(p => `<a href="/${p.slug}/" style="background:white;border:1px solid #D8E4DC;border-radius:12px;padding:20px;display:block;transition:border-color 0.2s;" onmouseover="this.style.borderColor='#6FAACB'" onmouseout="this.style.borderColor='#D5E8F0'"><div style="font-size:0.71rem;color:#6A7A70;margin-bottom:5px;">${p.date_fmt}</div><div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:0.95rem;color:#1A2018;line-height:1.35;">${escapeHtml(p.title)}</div></a>`).join('')}
  </div>
</div>` : '';

    fs.writeFileSync(`${dir}/index.html`, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(post.title)} — Divorce Angels</title>
<meta name="description" content="${escapeHtml(post.excerpt.slice(0,155))}">
<meta property="og:title" content="${escapeHtml(post.title)}">
<meta property="og:image" content="${post.cover_img}">
<meta property="og:type" content="article">
<link rel="canonical" href="https://thedivorceangels.com/${slug}/">
${SHARED_CSS}
<style>
.post-hero{background:var(--g0);padding:52px 0 44px;border-bottom:1px solid var(--bdr)}
.back{font-size:0.84rem;color:var(--g4);display:inline-flex;align-items:center;gap:5px;margin-bottom:22px}
.post-title{font-size:clamp(1.8rem,3.5vw,2.8rem);color:var(--ink);margin:14px 0}
.post-body{max-width:740px;margin:0 auto;padding:52px 0 64px}
.post-body h2{font-size:1.5rem;color:var(--ink);margin:36px 0 14px}
.post-body h3{font-size:1.2rem;color:var(--ink);margin:28px 0 12px}
.post-body p{font-size:1.02rem;color:var(--ink-m);line-height:1.8;margin-bottom:20px}
.post-body ul,.post-body ol{color:var(--ink-m);padding-left:24px;margin-bottom:20px}
.post-body li{line-height:1.75;margin-bottom:6px;font-size:1.02rem}
.post-body a{color:var(--g4);text-decoration:underline}
.post-body img{border-radius:10px;margin:28px auto}
.post-body blockquote{border-left:3px solid var(--g4);padding:14px 20px;margin:28px 0;background:var(--g0);border-radius:0 8px 8px 0}
.angel-cta{background:var(--g1);border-radius:14px;padding:32px 36px;margin:48px 0;display:flex;align-items:center;justify-content:space-between;gap:24px;border:1px solid var(--bdr)}
.angel-cta h3{font-family:'DM Serif Display',serif;font-size:1.25rem;color:var(--ink);margin-bottom:6px}
.angel-cta a{background:var(--g5);color:white;font-size:0.88rem;font-weight:500;padding:12px 22px;border-radius:8px;white-space:nowrap;flex-shrink:0}
@media(max-width:860px){.angel-cta{flex-direction:column}}
</style>
</head>
<body>
${NAV}
<div class="post-hero">
  <div class="container">
    <a href="/blog/" class="back">← Back to blog</a>
    <div style="max-width:760px;">
      ${tag(post.category || 'Wellness', '0.7rem', '4px 12px')}
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <div style="font-size:0.82rem;color:var(--ink-l);">${post.date_fmt}</div>
    </div>
  </div>
</div>
<img src="${post.cover_img}" alt="${escapeHtml(post.title)}" style="width:100%;max-height:420px;object-fit:cover;display:block;">
<div class="container">
  <div class="post-body">
    ${htmlContent}
    <div class="angel-cta">
      <div><h3>Have a question about your situation?</h3><p style="font-size:0.88rem;margin:0;">Angel is your free AI divorce coach — available 24/7, no judgment, no hourly rate.</p></div>
      <a href="/#angel-section">✦ Ask Angel — free</a>
    </div>
  </div>
  ${relHtml}
</div>
${FOOTER}
</body>
</html>`);
});

// Build blog index pages
const POSTS_PER_PAGE = 24;
const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
const categories = ['All', 'Legal', 'Financial', 'Co-Parenting', 'Emotional', 'Life After', 'Wellness'];

function buildBlogIndex(pagePosts, pageNum, totalPages, activeCategory = 'All') {
    const catPills = categories.map(c => {
        const href = c === 'All' ? '/blog/' : `/blog/category/${c.toLowerCase().replace(/ /g, '-').replace(/-/g, '_')}/`;
        const active = c === activeCategory ? ' active' : '';
        return `<a href="${href}" class="cat-pill${active}">${c}</a>`;
    }).join('');

    const feat = pageNum === 1 && pagePosts[0];
    const rest = pageNum === 1 ? pagePosts.slice(1) : pagePosts;

    const featHtml = feat ? `<a href="/${feat.slug}/" class="feat-card">
      <div class="feat-img"><img src="${feat.cover_img}" alt="${escapeHtml(feat.title)}" loading="lazy"></div>
      <div class="feat-body">
        <div style="margin-bottom:12px;">${tag(feat.category)}</div>
        <h2 style="font-size:1.6rem;color:var(--ink);margin-bottom:14px;line-height:1.25;">${escapeHtml(feat.title)}</h2>
        <p style="font-size:0.9rem;color:var(--ink-m);line-height:1.7;margin-bottom:20px;">${escapeHtml(feat.excerpt)}</p>
        <div style="font-size:0.75rem;color:var(--ink-l);">${feat.date_fmt}</div>
      </div>
    </a>` : '';

    const cards = rest.map(p => `<a href="/${p.slug}/" class="blog-card">
      <img src="${p.cover_img}" alt="${escapeHtml(p.title)}" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;">
      <div style="padding:18px 20px 22px;flex:1;display:flex;flex-direction:column;">
        <div style="margin-bottom:8px;">${tag(p.category)}</div>
        <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1rem;font-weight:400;color:var(--ink);line-height:1.35;margin-bottom:10px;flex:1;">${escapeHtml(p.title)}</h3>
        <div style="font-size:0.72rem;color:var(--ink-l);">${p.date_fmt}</div>
      </div>
    </a>`).join('');

    const prevBtn = pageNum > 1 ? `<a href="${pageNum === 2 ? '/blog/' : `/blog/page/${pageNum-1}/`}" class="pag-btn">← Newer</a>` : '';
    const nextBtn = pageNum < totalPages ? `<a href="/blog/page/${pageNum+1}/" class="pag-btn">Older →</a>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Blog — Divorce Angels</title>
<meta name="description" content="Expert articles on divorce — legal process, finances, emotional wellness, co-parenting, and building a new life.">
${SHARED_CSS}
<style>
.blog-hero{background:var(--g0);padding:72px 0 56px;border-bottom:1px solid var(--bdr)}
.cat-pill{font-size:0.82rem;font-weight:500;padding:8px 18px;border-radius:20px;border:1.5px solid var(--bdr);color:var(--ink-m);transition:all 0.2s}
.cat-pill:hover,.cat-pill.active{background:var(--g5);color:white;border-color:var(--g5)}
.feat-card{display:grid;grid-template-columns:1.2fr 1fr;border-radius:16px;overflow:hidden;border:1px solid var(--bdr);margin-bottom:32px;transition:box-shadow 0.2s,transform 0.2s}
.feat-card:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(44,82,64,0.08);border-color:var(--g4)}
.feat-img{overflow:hidden}.feat-img img{width:100%;height:100%;object-fit:cover}
.feat-body{padding:40px 44px;display:flex;flex-direction:column;justify-content:center;background:white}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:48px}
.blog-card{background:white;border:1px solid var(--bdr);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s}
.blog-card:hover{border-color:var(--g4);transform:translateY(-3px);box-shadow:0 12px 36px rgba(44,82,64,0.08)}
.pag{display:flex;align-items:center;justify-content:center;gap:20px;padding:20px 0 60px}
.pag-btn{font-size:0.88rem;font-weight:500;color:var(--g5);background:var(--g1);padding:10px 22px;border-radius:8px}
.pag-btn:hover{background:var(--g2)}
@media(max-width:900px){.feat-card{grid-template-columns:1fr}.cards-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.cards-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
${NAV}
<div class="blog-hero">
  <div class="container">
    <h1 style="font-size:clamp(2rem,4vw,2.8rem);color:var(--ink);margin-bottom:12px;">Insight for every <em style="font-style:italic;color:var(--g5);">stage of the journey</em></h1>
    <p style="font-size:1rem;color:var(--ink-m);max-width:520px;">Expert articles on legal process, finances, emotional wellness, co-parenting, and building a new life.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;">${catPills}</div>
  </div>
</div>
<div style="padding:56px 0 0;">
  <div class="container">
    ${featHtml}
    <div class="cards-grid">${cards}</div>
    <div class="pag">${prevBtn}<span style="font-size:0.84rem;color:var(--ink-l);">Page ${pageNum} of ${totalPages}</span>${nextBtn}</div>
  </div>
</div>
${FOOTER}
</body>
</html>`;
}

// Write blog index pages
if (!fs.existsSync('./blog')) fs.mkdirSync('./blog', { recursive: true });
fs.writeFileSync('./blog/index.html', buildBlogIndex(posts.slice(0, POSTS_PER_PAGE), 1, totalPages));

for (let p = 2; p <= totalPages; p++) {
    const dir = `./blog/page/${p}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const start = (p - 1) * POSTS_PER_PAGE;
    fs.writeFileSync(`${dir}/index.html`, buildBlogIndex(posts.slice(start, start + POSTS_PER_PAGE), p, totalPages));
}

// Category pages
['Legal', 'Financial', 'Co-Parenting', 'Emotional', 'Life After', 'Wellness'].forEach(cat => {
    const catPosts = posts.filter(p => p.category === cat);
    const slug = cat.toLowerCase().replace(/ /g, '-').replace(/-/g, '_');
    const dir = `./blog/category/${slug}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/index.html`, buildBlogIndex(catPosts.slice(0, POSTS_PER_PAGE), 1, 1, cat));
});

console.log(`✓ Built ${posts.length} posts, ${totalPages} index pages, 6 category pages`);

// ── Update homepage blog cards with 6 most recent posts ──
const TAG_STYLES_HP = {
    'Legal':        'background:#EAF0EC;color:#2C3E35',
    'Financial':    'background:#EEF5E8;color:#2E6B27',
    'Co-Parenting': 'background:#E8EEFF;color:#2D4A6B',
    'Life After':   'background:#EDE5E0;color:#6B4A3A',
    'Emotional':    'background:#EDE8F8;color:#5240A8',
    'Wellness':     'background:#FFF0E8;color:#7A3D18',
};

function hpTag(cat) {
    const style = TAG_STYLES_HP[cat] || 'background:#eee;color:#333';
    return `<span class="btag" style="${style}">${cat}</span>`;
}

if (fs.existsSync('./index.html')) {
    let hp = fs.readFileSync('./index.html', 'utf8');
    const hp6 = posts.slice(0, 6);

    const newCards = hp6.map(p => `
          <a href="/${p.slug}/" class="blog-card">
            <img class="blog-img" src="${p.cover_img}" alt="${escapeHtml(p.title)}">
            <div class="blog-body">
              ${hpTag(p.category || 'Wellness')}
              <h3 class="blog-title">${escapeHtml(p.title)}</h3>
              <div class="blog-meta">${p.date_fmt}</div>
            </div>
          </a>`).join('');

    const newBlogSection = `<!-- BLOG -->
    <section class="blog-section">
      <div class="container">
        <div class="section-hdr fade-up">
          <div>
            <div class="eyebrow">From the blog</div>
            <h2>Insight for every <em style="font-style:italic;color:var(--g5);">stage of the journey</em></h2>
          </div>
          <a href="/blog/" class="link-arrow">View all articles →</a>
        </div>
        <div class="blog-grid fade-up d1">
          ${newCards}
        </div>
      </div>
    </section>`;

    hp = hp.replace(/<!-- BLOG -->[\s\S]*?<\/section>/, newBlogSection);
    fs.writeFileSync('./index.html', hp);
    console.log('✓ Homepage blog cards updated with 6 latest posts');
}

// ── Generate latest-posts.json for homepage dynamic loading ──
const latest = posts.slice(0, 6).map(p => ({
    title: p.title,
    slug: p.slug,
    date_fmt: p.date_fmt,
    category: p.category,
    cover_img: p.cover_img,
    excerpt: p.excerpt ? p.excerpt.slice(0, 150) : ''
}));
fs.writeFileSync('./latest-posts.json', JSON.stringify(latest, null, 2));
console.log('✓ latest-posts.json written with 6 most recent posts');

