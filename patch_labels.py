import re, shutil, os

path = os.path.expanduser('~/Desktop/divorceangels-site/index.html')

# Backup
shutil.copy(path, path + '.backup2')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# 1. Hero eyebrow: "Your Divorce Angel" → "AI-guided divorce system"
old1 = '<em>Your Divorce Angel</em>\n      </div>'
new1 = 'AI-guided divorce system\n      </div>'
if old1 in content:
    content = content.replace(old1, new1, 1)
    changes += 1
    print("✓ Change 1: Hero eyebrow updated")
else:
    print("✗ Change 1: Hero eyebrow not found — check manually")

# 2. Community section: add eyebrow label before the comm-badge div
old2 = '  <div class="sec-wrap">\n    <div class="comm-inner">\n      <div class="comm-badge">'
new2 = '  <div class="sec-wrap">\n    <div class="comm-inner">\n      <p style="font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#6FAACB;margin-bottom:14px;text-align:center;">Your Community</p>\n      <div class="comm-badge">'
if old2 in content:
    content = content.replace(old2, new2, 1)
    changes += 1
    print("✓ Change 2: Community label added")
else:
    print("✗ Change 2: Community section not found — check manually")

# 3. Testimonials: centre-aligned eyebrow → left-aligned, and centre h2 → left
old3 = '<div class="sec-eyebrow" style="justify-content:center;">What people are saying</div>\n      <h2 class="sec-h2">Real people. <em>Real outcomes.</em></h2>'
new3 = '<div class="sec-eyebrow">What people are saying</div>\n      <h2 class="sec-h2">Real people. <em>Real outcomes.</em></h2>'
if old3 in content:
    content = content.replace(old3, new3, 1)
    changes += 1
    print("✓ Change 3: Testimonials header left-justified")
else:
    print("✗ Change 3: Testimonials header not found — check manually")

if changes > 0:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"\nDone! {changes}/3 changes saved to {path}")
    print(f"Backup at {path}.backup2")
else:
    print("\nNo changes made.")
