const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const results = path.join(root, 'test-results');
  await fs.mkdir(results, { recursive: true });
  const server = http.createServer(async (req, res) => {
    try {
      const filename = path.resolve(root, '.' + new URL(req.url, 'http://test').pathname.replace(/\/$/, '/index.html'));
      if (!filename.startsWith(root + path.sep)) throw Error('outside root');
      const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
      res.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream');
      res.end(await fs.readFile(filename));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
    const engine = await import(path.join(root, 'game.js'));
    const url = `http://127.0.0.1:${server.address().port}`;
    const errors = [];
    const instrument = page => {
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    };
    const readSave = page => page.evaluate(() => JSON.parse(localStorage.getItem('maijian-bakery-v1')));
    const click = (page, action) => page.locator(`[data-action="${action}"]`).click();
    async function newPage(seed, viewport = { width: 1440, height: 1050 }) {
      const context = await browser.newContext({ viewport });
      if (seed) await context.addInitScript(save => {
        if (!localStorage.getItem('maijian-bakery-v1')) localStorage.setItem('maijian-bakery-v1', JSON.stringify(save));
      }, seed);
      const page = await context.newPage(); instrument(page); await page.clock.install();
      await page.goto(url); await page.locator('h1').waitFor(); return page;
    }
    async function produce(page, product) {
      await click(page, `prepare:${product}`); await page.clock.runFor(4000);
      let s = await readSave(page); const tray = s.trays.find(t => t.product === product);
      assert.ok(tray); await click(page, `load:${tray.id}`);
      await page.clock.runFor(engine.getProduct(product).time * 1000);
      s = await readSave(page); const job = s.jobs.find(j => j.id === tray.id);
      assert.equal(engine.ovenStatus(job).tone, 'golden'); await click(page, `unload:${job.id}`);
      assert.ok((await readSave(page)).stock[product] >= 6);
    }
    function batch(s, product) { engine.prepareBatch(s, product); engine.advance(s, 4); engine.loadOven(s, s.trays[0].id); engine.advance(s, engine.getProduct(product).time); engine.removeBatch(s, s.jobs[0].id); }

    const page = await newPage();
    assert.equal(await page.getByRole('dialog').count(), 0, 'no mandatory onboarding');
    await page.screenshot({ path: path.join(results, 'desktop.png'), fullPage: true });
    await page.evaluate(() => window.originalCanvas = document.querySelector('#bakery-canvas'));
    await produce(page, 'roll');
    assert.equal(await page.locator('[data-testid=cash]').textContent(), '¥360', 'preparation uses existing ingredients, no double payment');
    await click(page, 'open'); await page.clock.runFor(6000);
    const first = (await readSave(page)).visitors[0];
    await click(page, `visitor:${first.id}`); await click(page, `ask:${first.id}`);
    assert.match(await page.locator('.need-summary').textContent(), /预算/);
    await click(page, `accept:${first.id}`);
    let save = await readSave(page), order = save.orders[0];
    assert.equal(save.stats.revenue, 0);
    await click(page, `assemble:${order.id}`); await click(page, `pack:${order.id}:paper`);
    save = await readSave(page); assert.equal(save.stock.roll, 5); assert.equal(save.orders[0].stage, 'packed');
    assert.equal(await page.evaluate(() => window.originalCanvas === document.querySelector('#bakery-canvas')), true, 'scene is retained across kitchen and order updates');
    await page.screenshot({ path: path.join(results, 'packed-order.png'), fullPage: true });
    await page.reload(); await page.locator('h1').waitFor();
    assert.equal((await readSave(page)).stock.roll, 5, 'reserved goods not deducted again after reload');
    await click(page, `deliver:${order.id}`);
    save = await readSave(page); assert.equal(save.stats.served, 1); assert.ok(save.stats.revenue >= 10); assert.equal(save.orders.length, 0);
    await page.screenshot({ path: path.join(results, 'service.png'), fullPage: true });
    await click(page, 'prepare:toast');
    await click(page, 'pause'); const paused = await readSave(page); await page.clock.runFor(10000);
    assert.deepEqual((await readSave(page)).trays, paused.trays); assert.equal((await readSave(page)).elapsed, paused.elapsed);
    await click(page, 'pause'); await page.clock.runFor(4000);
    assert.equal((await readSave(page)).trays[0].remaining, 0);
    await click(page, 'close-confirm'); await page.getByRole('dialog').locator('[data-action="close"]').click();
    assert.match(await page.getByRole('dialog').textContent(), /营业利润/);
    assert.equal((await readSave(page)).phase, 'closed');
    await page.getByRole('dialog').locator('[data-action="next"]').click();
    assert.equal((await readSave(page)).day, 2);
    console.log('PASS desktop: manual preparation → load → golden bake → unload → inquiry → accept → pickup → package → reload → deliver → pause → close → next day');

    await page.locator('.sidebar [data-action="recipes"]').click();
    assert.equal(await page.locator('.product-card').count(), 6);
    await click(page, 'menu:toast'); assert.equal((await readSave(page)).menu.length, 2);
    await click(page, 'menu:toast'); assert.equal((await readSave(page)).menu.length, 3);
    await page.locator('.sidebar [data-action="upgrades"]').click();
    await click(page, 'upgrade:prep'); assert.equal((await readSave(page)).upgrades.prep, 1);
    await click(page, 'theme:rose'); await page.reload(); await page.locator('h1').waitFor();
    assert.equal(await page.locator('.theme-rose').count(), 1);
    await page.locator('.sidebar [data-action="journal"]').click(); assert.equal(await page.locator('.review-row').count(), 1);
    await page.locator('.topbar [data-action="settings"]').click();
    const downloadEvent = page.waitForEvent('download'); await click(page, 'export');
    const download = await downloadEvent, exported = path.join(results, 'save.json'); await download.saveAs(exported);
    const payload = JSON.parse(await fs.readFile(exported, 'utf8')); assert.equal(engine.validateSave(payload), true);
    const before = (await readSave(page)).cash;
    await page.locator('#import-save').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":2}') });
    await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('格式不正确'));
    assert.equal((await readSave(page)).cash, before);
    payload.cash += 123; page.once('dialog', d => d.accept());
    await page.locator('#import-save').setInputFiles({ name: 'save.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(payload)) });
    await page.locator('.work-layout').waitFor(); assert.equal((await readSave(page)).cash, before + 123);
    console.log('PASS menu, functional upgrade, theme persistence, reviews, export/import and corrupt-file protection');

    const sliceSeed = engine.createGame(42); batch(sliceSeed, 'toast'); engine.openShop(sliceSeed); engine.advance(sliceSeed, 6);
    Object.assign(sliceSeed.visitors[0], { name: '林奶奶', regular: 'lin', look: 3, requested: 'toast', need: 'slice', budget: 24, patience: 110, remaining: 110, duration: 110 });
    assert.equal(engine.validateSave(sliceSeed), true);
    const sliced = await newPage(sliceSeed), lin = sliceSeed.visitors[0];
    await click(sliced, `ask:${lin.id}`); assert.match(await sliced.locator('.need-summary').textContent(), /切片/);
    await click(sliced, `accept:${lin.id}`); const slicingOrder = (await readSave(sliced)).orders[0];
    await click(sliced, `assemble:${slicingOrder.id}`); await click(sliced, `slice:${slicingOrder.id}`);
    assert.equal(await sliced.locator(`[data-action="pack:${slicingOrder.id}:paper"]`).count(), 0, 'cannot package while slicing');
    await sliced.clock.runFor(3000); await click(sliced, `pack:${slicingOrder.id}:paper`); await click(sliced, `deliver:${slicingOrder.id}`);
    assert.ok((await readSave(sliced)).reviews[0].score >= 85); assert.ok((await readSave(sliced)).affection.lin > 0);
    console.log('PASS specific requirement: confirm toast slicing, wait for task, package, deliver and earn relationship');

    const resSeed = engine.createGame(42); batch(resSeed, 'roll'); engine.acceptReservation(resSeed);
    const resOrder = resSeed.orders[0]; engine.startAssembly(resSeed, resOrder.id); engine.packOrder(resSeed, resOrder.id, 'gift'); engine.openShop(resSeed); engine.advance(resSeed, 149);
    assert.equal(engine.validateSave(resSeed), true);
    const reservation = await newPage(resSeed);
    await reservation.clock.runFor(1000); await click(reservation, `deliver:${resOrder.id}`);
    assert.equal((await readSave(reservation)).orderDone, true);
    console.log('PASS six-piece preorder: reserved ticket, gift preparation and collection by the actual courier');

    const old = JSON.parse(await fs.readFile(path.join(root, 'tests/fixtures/v1-save.json'), 'utf8'));
    const legacy = await newPage(old); const migrated = await readSave(legacy);
    assert.equal(migrated.version, 2); assert.equal(migrated.cash, old.cash); assert.equal(migrated.day, old.day); assert.equal(migrated.affection.lin, 7); assert.equal(migrated.upgrades.oven, 1);
    assert.equal(engine.validateSave(migrated), true);
    console.log('PASS v1.1 save migration retains progress, cash, relationship, paid batch and oven');

    const mobile = await newPage(null, { width: 390, height: 844 });
    await produce(mobile, 'roll'); await click(mobile, 'open'); await mobile.clock.runFor(6000);
    const mv = (await readSave(mobile)).visitors[0]; await click(mobile, `ask:${mv.id}`); await click(mobile, `accept:${mv.id}`);
    const mo = (await readSave(mobile)).orders[0]; await click(mobile, 'jump:orders');
    await click(mobile, `assemble:${mo.id}`); await click(mobile, `pack:${mo.id}:paper`); await click(mobile, `deliver:${mo.id}`);
    assert.equal((await readSave(mobile)).stats.served, 1);
    await mobile.screenshot({ path: path.join(results, 'mobile.png'), fullPage: true });
    for (const width of [320, 390, 768]) { await mobile.setViewportSize({ width, height: 844 }); assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `no overflow at ${width}px`); }
    for (const nav of ['recipes', 'upgrades', 'journal']) { await mobile.locator(`.sidebar [data-action="${nav}"]`).click(); assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); }
    console.log('PASS mobile: complete service, quick station navigation, four views and 320/390/768px layout');

    const standaloneContext = await browser.newContext(), standalone = await standaloneContext.newPage(); instrument(standalone);
    const requests = []; standalone.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
    await standalone.setContent('<!doctype html><html><body></body></html>');
    const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
    await standalone.evaluate(html => { const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts allow-downloads allow-modals'); f.srcdoc = html; document.body.appendChild(f); }, html);
    const preview = standalone.frameLocator('iframe'); await preview.locator('h1').waitFor();
    const pf = await (await preview.locator('h1').elementHandle()).ownerFrame();
    await preview.locator('[data-action="prepare:roll"]').click();
    await pf.waitForFunction(() => [...document.querySelectorAll('[data-action^="load:"]')].some(b => !b.disabled), null, { timeout: 10000 });
    await preview.locator('[data-action^="load:"]').click();
    await pf.waitForFunction(() => document.querySelector('.baking-job.golden'), null, { timeout: 25000 });
    await preview.locator('[data-action^="unload:"]').click(); await preview.locator('[data-action="open"]').click();
    await pf.waitForFunction(() => document.querySelector('[data-action^="accept:"]'), null, { timeout: 15000 });
    await preview.locator('[data-action^="ask:"]').click(); await preview.locator('[data-action^="accept:"]').click();
    await preview.locator('[data-action^="assemble:"]').click(); await preview.locator('[data-action$=":paper"]').click(); await preview.locator('[data-action^="deliver:"]').click();
    assert.match(await preview.locator('.purchase-receipt').textContent(), /已交付/); assert.deepEqual(requests, []); assert.deepEqual(errors, []);
    console.log('PASS standalone: manual production and real service in opaque, storage-denied iframe; zero external requests');
    console.log('Screenshots saved to test-results/desktop.png, packed-order.png, service.png and mobile.png');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
