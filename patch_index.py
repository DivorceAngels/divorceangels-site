import re, shutil, os

path = os.path.expanduser('~/Desktop/divorceangels-site/index.html')

# Backup first
shutil.copy(path, path + '.backup')
print(f"Backup saved: {path}.backup")

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the old section: from the comment to just before the next section comment
old_pattern = r'<!-- 3\. HOW ANGEL WORKS -->.*?(?=<!-- 4\.)'
new_section = '''<!-- 3. AI COACH -->
<section class="bg-white full-sec">
  <div class="sec-wrap" style="max-width:900px;">
    <p style="font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#6FAACB;margin-bottom:10px;">Your AI Coach</p>
    <h2 style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:38px;font-weight:700;color:#1A2A35;line-height:1.15;margin-bottom:2px;">Ask anything.</h2>
    <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:38px;font-weight:400;font-style:italic;color:#6FAACB;line-height:1.15;margin-bottom:22px;">Angel already knows your file.</div>
    <p style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:17px;color:#4a6878;line-height:1.72;max-width:600px;margin-bottom:36px;">Alongside your financial analysis and settlement scenarios, <em>Your Divorce Angel</em> is available any time to answer your questions, explain your options, and help you prepare &mdash; with no judgment and no hourly rate.</p>
    <div style="background:#e8f2f8;border-radius:14px;border:.5px solid #b8d6e8;overflow:hidden;margin-bottom:20px;">
      <div style="background:#d4e9f3;padding:13px 20px;display:flex;align-items:center;gap:9px;border-bottom:.5px solid #b8d6e8;">
        <div style="width:9px;height:9px;border-radius:50%;background:#6FAACB;flex-shrink:0;"></div>
        <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:14px;font-style:italic;color:#1A2A35;opacity:.85;"><em>Your Divorce Angel</em></div>
        <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:12px;font-style:italic;color:#6FAACB;margin-left:auto;">Live &middot; Ask me anything</div>
      </div>
      <div style="padding:20px 20px 16px;display:flex;flex-direction:column;gap:14px;">
        <div style="align-self:flex-end;background:#ffffff;border:.5px solid #b8d6e8;border-radius:14px 14px 3px 14px;padding:11px 17px;max-width:62%;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:15px;font-style:italic;color:#1A2A35;line-height:1.5;box-shadow:0 1px 4px rgba(0,0,0,.05);">Should I try to keep the house or sell it?</div>
        <div style="align-self:flex-start;background:#6b9fc0;border-radius:3px 14px 14px 14px;padding:14px 17px;max-width:74%;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:15px;color:rgba(255,255,255,.96);line-height:1.72;">Based on your snapshot, <strong style="color:#ffffff;font-weight:700;">selling puts you $57,500 ahead</strong> of a buyout. With your income, carrying the mortgage alone would consume 68% of your take-home. I&rsquo;d fight for the sale and redirect that equity toward your retirement gap.</div>
        <div style="align-self:flex-end;background:#ffffff;border:.5px solid #b8d6e8;border-radius:14px 14px 3px 14px;padding:11px 17px;max-width:62%;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:15px;font-style:italic;color:#1A2A35;line-height:1.5;box-shadow:0 1px 4px rgba(0,0,0,.05);">My husband says his 401(k) is all his. Is that true?</div>
        <div style="align-self:flex-start;background:#6b9fc0;border-radius:3px 14px 14px 14px;padding:14px 17px;max-width:74%;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:15px;color:rgba(255,255,255,.96);line-height:1.72;">No. Contributions made during the marriage are <strong style="color:#ffffff;font-weight:700;">marital property</strong> in every US state. Based on your entries, you&rsquo;re entitled to approximately <strong style="color:#ffffff;font-weight:700;">$74,000</strong>. This is secured through a QDRO &mdash; don&rsquo;t leave this on the table.</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px 16px;border-top:.5px solid #c8dde8;background:rgba(255,255,255,.45);">
        <span style="background:#ffffff;border:.5px solid #b8d6e8;border-radius:22px;padding:7px 15px;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:13px;font-style:italic;color:#4a6878;">How does mediation work?</span>
        <span style="background:#ffffff;border:.5px solid #b8d6e8;border-radius:22px;padding:7px 15px;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:13px;font-style:italic;color:#4a6878;">What am I entitled to?</span>
        <span style="background:#ffffff;border:.5px solid #b8d6e8;border-radius:22px;padding:7px 15px;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:13px;font-style:italic;color:#4a6878;">I feel overwhelmed</span>
        <span style="background:#ffffff;border:.5px solid #b8d6e8;border-radius:22px;padding:7px 15px;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:13px;font-style:italic;color:#4a6878;">Where do I start?</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div style="background:#EDF4F8;border-radius:12px;border:.5px solid #b8d6e8;padding:22px 22px 24px;">
        <div style="font-size:22px;margin-bottom:12px;line-height:1;">&#129517;</div>
        <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:16px;font-weight:600;color:#1A2A35;margin-bottom:8px;line-height:1.3;">Remembers everything about your situation</div>
        <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:14px;font-style:italic;color:#4a6878;line-height:1.65;">Angel picks up exactly where you left off &mdash; whether you&rsquo;re working with a lawyer, a mediator, or going it alone. Every answer is specific to your numbers, your jurisdiction, and your family.</div>
      </div>
      <div style="background:#EDF4F8;border-radius:12px;border:.5px solid #b8d6e8;padding:22px 22px 24px;">
        <div style="font-size:22px;margin-bottom:12px;line-height:1;">&#128153;</div>
        <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:16px;font-weight:600;color:#1A2A35;margin-bottom:8px;line-height:1.3;">Available at 2am when your mind won&rsquo;t stop</div>
        <div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:14px;font-style:italic;color:#4a6878;line-height:1.65;">No judgment. No hourly rate. Ask anything about the legal process, what you&rsquo;re entitled to, how to handle a difficult conversation, or simply how you&rsquo;re feeling. Angel is always there.</div>
      </div>
    </div>
  </div>
</section>

'''

result = re.sub(old_pattern, new_section, content, flags=re.DOTALL)

if result == content:
    print("ERROR: Pattern not found — no changes made.")
else:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(result)
    print("SUCCESS: Section replaced and file saved!")
    print(f"Original backed up to: {path}.backup")
