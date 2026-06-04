// build.js - updated June 4 2026
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

const SHARED_CSS = `<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PT5NYFWVTB"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PT5NYFWVTB');
</script>
<!-- End Google Analytics -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" rel="stylesheet">
<style>
:root{--g0:#EDF4F8;--g1:#CFE6F3;--g2:#9DCBE4;--g4:#6FAACB;--g5:#1A3A4F;--blue:#4a7fa5;--ink:#1A2A35;--ink-m:#4a6878;--ink-l:#6A8A9F;--bdr:#b8d6e8}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Cormorant Garamond',Georgia,serif;background:#fff;color:var(--ink);font-size:20px;line-height:1.8;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}a{text-decoration:none;color:inherit}
h1,h2,h3{font-family:Georgia,serif;font-weight:400;line-height:1.2}
h1{font-size:clamp(2.2rem,4vw,3rem)}h2{font-size:clamp(1.8rem,3vw,2.5rem)}h3{font-size:1.4rem}
p{color:var(--ink-m);line-height:1.75;font-size:19px;font-family:'Cormorant Garamond',Georgia,serif}
.container{max-width:1060px;margin:0 auto;padding:0 48px}
.nav-logo-bar{background:white;width:100%;padding:14px 40px;display:flex;align-items:center;justify-content:center;position:sticky;top:0;z-index:101;border-bottom:1px solid #EDF4F8;box-sizing:border-box;}
.nav-logo{height:68px;mix-blend-mode:multiply;display:block;}
nav.nav{background:#9DCBE4;width:100%;height:52px;display:flex;align-items:center;justify-content:center;padding:0 36px;position:sticky;top:96px;z-index:99;border:none;}
nav.nav .nav-links{display:flex;gap:36px;font-size:19px;flex:1;justify-content:center;align-items:center;list-style:none;}
nav.nav .nav-links a{color:white!important;font-size:19px!important;text-decoration:none;letter-spacing:.02em;}
nav.nav .nav-links a:hover{color:rgba(255,255,255,.8)!important;}
.cta-btn{position:fixed;top:22px;right:32px;z-index:200;background:#6FAACB;color:white;font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:600;padding:10px 22px;border-radius:8px;text-decoration:none;letter-spacing:.02em;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.cta-btn:hover{background:#5A9ABB;}
footer{background:#4a7fa5;padding:48px 0 28px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:40px}
.footer-tag{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.65;max-width:260px;margin-bottom:22px}
.footer-col-title{font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:16px}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:11px}.footer-links a{font-size:14px;color:rgba(255,255,255,0.55)}.footer-links a:hover{color:white}
.footer-bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.footer-bottom-txt{font-size:12px;color:rgba(255,255,
