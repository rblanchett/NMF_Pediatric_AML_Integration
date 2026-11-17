"""Run: python tests/smoke_test.py   (Playwright + Chromium). Does not need real data."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'assets/styles.css').read_text(encoding='utf-8')
original=(root/'data/original-group-annotations.js').read_text(encoding='utf-8')
app=(root/'assets/app.js').read_text(encoding='utf-8')
fixture={"meta":{"mode":"demo"},"nodes":[{"id":f"nmf{i}","primaryPatients":25} for i in range(1,24)],"edges":[{"source":"nmf5","target":"nmf23","population":"All","feature":"Sex","level":"Female","family":"Sex","effect":0.2,"q":0.001,"status":"tested","nBridge":15,"nNonBridge":25,"nSource":40,"unit":"proportion","pBridge":0.6,"pNonBridge":0.4,"primaryTest":"Fisher"}],"counts":[{"source":"nmf5","target":"nmf23","population":"All","nBridge":15,"nNonBridge":25,"nSource":40}],"cpg":[{"pair":"nmf5__to__nmf23","nUnique":100,"nPrimaryOnly":50,"nConservedOnly":40,"nBoth":10,"nNeither":0}],"km":{}}
html=html.replace('<link rel="stylesheet" href="assets/styles.css">','<style>'+css+'</style>')
for s in ('network-data.js','original-group-annotations.js','assets/app.js'):
 html=html.replace(f'<script defer src="{ "data/" if ".js" in s and "/" not in s else ""}{s}"></script>','')
# remove any still present referenced scripts
import re
html=re.sub(r'<script defer src="[^"]+"></script>','',html)
html=html.replace('</body>', '<script>window.NMF_BRIDGE_DATA = '+json.dumps(fixture)+';</script><script>'+original+'</script><script>'+app+'</script></body>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1570,'height':1050},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 assert page.locator('g.network-node').count()==23
 assert page.locator('g.network-edge').count()>0
 page.locator('#layoutForce').click()
 assert 'force-directed' in page.locator('#viewSubtitle').inner_text()
 page.locator('#layoutCircular').click()
 assert 'circular' in page.locator('#viewSubtitle').inner_text()
 page.locator('g.network-node[data-id="nmf6"]').focus()
 page.keyboard.press('Enter')
 v=page.locator('#inspectorBody').inner_text()
 assert 'Original NMF pairwise survival comparisons' in v,v[:900]
 assert 'BH-significant' in v
 assert 'Original primary-group clinical characteristics' in v
 assert 'Cox model' not in v
 page.locator('g.network-edge').first.focus()
 page.keyboard.press('Enter')
 assert 'Incoming patients' in page.locator('#inspectorBody').inner_text()
 assert not errors,errors
 print('PASS: original group + 23 nodes + layout toggle + clinical arrows + pairwise statistics')
 b.close()
