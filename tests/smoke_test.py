"""Optional smoke test: python tests/smoke_test.py (requires playwright + Chromium)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'assets/styles.css').read_text(encoding='utf-8')
data=(root/'data/network-data.js').read_text(encoding='utf-8')
js=(root/'assets/app.js').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="assets/styles.css">', '<style>'+css+'</style>')
html=html.replace('<script defer src="data/network-data.js"></script>', '')
html=html.replace('<script defer src="assets/app.js"></script>', '')
html=html.replace('</body>', '<script>'+data+'</script><script>'+js+'</script></body>')
with sync_playwright() as p:
    b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=b.new_page(viewport={'width':1500,'height':980}, device_scale_factor=1)
    failures=[]
    page.on('pageerror',lambda e:failures.append(str(e)))
    page.set_default_timeout(4500)
    page.set_content(html, wait_until='domcontentloaded')
    assert page.locator('g.network-node').count()==23
    assert page.locator('g.network-edge').count()>0
    page.locator('#layoutForce').click()
    page.wait_for_timeout(750)
    assert 'force-directed' in page.locator('#viewSubtitle').inner_text()
    page.locator('#layoutCircular').click()
    page.wait_for_timeout(750)
    assert 'circular' in page.locator('#viewSubtitle').inner_text()
    page.locator('g.network-edge').first.focus()
    page.keyboard.press('Enter')
    assert 'Incoming patients' in page.locator('#inspectorBody').inner_text()
    page.screenshot(path=str(Path(__file__).resolve().parents[1]/'preview-demo.png'),full_page=True)
    assert not failures,failures
    print('PASS: 23 nodes, edges, layout toggle, edge inspector, no JS errors')
    b.close()
