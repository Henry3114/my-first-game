import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as g from '../game.js';
const fresh = () => g.createGame(42);
function batch(s, product = 'roll', qualityTime = null) {
  assert.ok(g.prepareBatch(s, product).ok); g.advance(s, 4);
  const tray = s.trays.at(-1); assert.ok(g.loadOven(s, tray.id).ok);
  const j = s.jobs.at(-1); g.advance(s, qualityTime ?? j.duration); assert.ok(g.removeBatch(s, j.id).ok);
}
function request(s, product = 'roll', need = 'plain') {
  if (s.phase === 'prep') { assert.ok(g.openShop(s).ok); g.advance(s, 6); }
  let v = s.visitors.find(v => v.stage === 'waiting');
  if (!v) { g.advance(s, 20); v = s.visitors.find(v => v.stage === 'waiting'); }
  assert.ok(v); Object.assign(v, { requested: product, selected: null, need, budget: 200, remaining: 120, duration: 120 });
  assert.ok(g.askVisitor(s, v.id).ok); assert.ok(g.acceptOrder(s, v.id).ok);
  return s.orders.find(o => o.visitorId === v.id);
}
function finish(s, o, packaging = 'paper') { assert.ok(g.startAssembly(s, o.id).ok); assert.ok(g.packOrder(s, o.id, packaging).ok); return g.deliverOrder(s, o.id); }

test('start directly with menu, pantry, no guided phase and no free automatic sales', () => {
  const s = fresh(); assert.equal(s.version, 2); assert.equal(s.phase, 'prep'); assert.equal(s.cash, 360);
  assert.equal(g.validateSave(s), true); assert.match(g.openShop(s).error, /准备/);
  batch(s); g.openShop(s); g.advance(s, 110);
  assert.equal(s.stats.revenue, 0); assert.equal(s.stock.roll, 6); assert.ok(s.stats.missed > 0);
});
test('raw procurement and production do not charge ingredient costs twice', () => {
  const s = fresh(); const oldPantry = s.pantry.flour;
  g.buyIngredient(s, 'flour'); assert.equal(s.cash, 320); assert.equal(s.pantry.flour, oldPantry + 20);
  assert.equal(s.stats.purchases, 40); assert.equal(s.stats.expense, 0);
  assert.ok(g.prepareBatch(s, 'roll').ok); assert.equal(s.cash, 320);
  assert.equal(s.pantry.flour, oldPantry + 17); assert.equal(s.stats.materials, 18); assert.equal(s.stats.expense, 18);
});
test('mixing and oven transfers are manual; prepared trays occupy the station', () => {
  const s = fresh(); g.prepareBatch(s, 'roll');
  assert.ok(g.loadOven(s, s.trays[0].id).error); assert.ok(g.prepareBatch(s, 'toast').error);
  g.advance(s, 10); assert.equal(s.stock.roll, 0); assert.equal(s.jobs.length, 0);
  g.loadOven(s, s.trays[0].id); assert.ok(g.prepareBatch(s, 'toast').ok);
  g.advance(s, 20); assert.equal(s.stock.roll, 0); assert.equal(s.trays[0].remaining, 0);
  assert.ok(g.loadOven(s, s.trays[0].id).error); g.removeBatch(s, s.jobs[0].id); assert.equal(s.stock.roll, 6);
});
test('golden window and premature or burnt removal produce different quality', () => {
  const gold = fresh(), raw = fresh(), burnt = fresh(); batch(gold, 'roll'); batch(raw, 'roll', 0); batch(burnt, 'roll', 30);
  assert.equal(g.stockInfo(gold, 'roll').quality, 100); assert.equal(g.stockInfo(raw, 'roll').quality, 35); assert.equal(g.stockInfo(burnt, 'roll').quality, 30);
  const a = request(gold), b = request(raw); finish(gold, a); finish(raw, b);
  assert.ok(gold.stats.revenue > raw.stats.revenue); assert.ok(gold.reviews[0].score > raw.reviews[0].score);
});
test('menu choice enforces three recipes, production commitment and preopening changes', () => {
  const s = fresh(); s.reputation = 50; assert.ok(g.research(s, 'cinnamon').ok);
  assert.ok(g.toggleMenu(s, 'cinnamon').error); g.toggleMenu(s, 'toast'); assert.ok(g.toggleMenu(s, 'cinnamon').ok);
  g.prepareBatch(s, 'roll'); assert.ok(g.toggleMenu(s, 'roll').error); g.openShop(s); assert.ok(g.toggleMenu(s, 'croissant').error);
});
test('customer purpose and budget constrain recommendation without granting greeting money', () => {
  const s = fresh(); batch(s); g.openShop(s); g.advance(s, 6); const v = s.visitors[0];
  const cash = s.cash; g.askVisitor(s, v.id); assert.equal(v.known, true); assert.equal(v.budget, 12); assert.equal(s.cash, cash);
  assert.ok(g.recommendVisitor(s, v.id, 'croissant').error); assert.ok(g.recommendVisitor(s, v.id, 'roll').ok);
  const patience = v.remaining; g.waitVisitor(s, v.id); assert.equal(v.remaining, patience + 15); assert.ok(g.waitVisitor(s, v.id).error);
});
test('a transaction requires accept, actual stock pickup, packaging and correct recipient', () => {
  const s = fresh(); batch(s); const o = request(s); const before = s.cash;
  assert.ok(g.deliverOrder(s, o.id).error); assert.ok(g.startAssembly(s, o.id).ok); assert.equal(s.stock.roll, 5);
  assert.ok(g.packOrder(s, o.id, 'paper').ok); assert.equal(s.cash, before - 1);
  assert.ok(g.deliverOrder(s, o.id, o.visitorId + 1).error); assert.equal(s.stats.revenue, 0);
  assert.ok(g.deliverOrder(s, o.id, o.visitorId).ok); assert.equal(s.orders.length, 0); assert.equal(s.stats.served, 1);
  const cash = s.cash; assert.ok(g.deliverOrder(s, o.id).error); assert.equal(s.cash, cash); assert.equal(g.validateSave(s), true);
});
test('only three orders and one assembly station can be active', () => {
  const s = fresh(); batch(s); g.openShop(s); g.advance(s, 60);
  const visitors = s.visitors.filter(v => v.stage === 'waiting'); assert.ok(visitors.length >= 3);
  for (const v of visitors.slice(0, 3)) { v.requested = 'roll'; v.need = 'plain'; assert.ok(g.acceptOrder(s, v.id).ok); }
  const extra = s.visitors.find(v => v.stage === 'waiting'); if (extra) assert.ok(g.acceptOrder(s, extra.id).error);
  g.startAssembly(s, s.orders[0].id); assert.ok(g.startAssembly(s, s.orders[1].id).error);
  g.packOrder(s, s.orders[0].id, 'paper'); assert.ok(g.startAssembly(s, s.orders[1].id).ok);
});
test('slicing is timed; correct handling improves the actual review', () => {
  const good = fresh(), bad = fresh(); batch(good, 'toast'); batch(bad, 'toast');
  const a = request(good, 'toast', 'slice'), b = request(bad, 'toast', 'slice');
  g.startAssembly(good, a.id); assert.ok(g.sliceOrder(good, a.id).ok); assert.ok(g.packOrder(good, a.id, 'paper').error);
  g.advance(good, 3); assert.equal(a.sliced, true); g.packOrder(good, a.id, 'paper'); g.deliverOrder(good, a.id);
  finish(bad, b); assert.ok(good.reviews[0].score > bad.reviews[0].score); assert.match(bad.reviews[0].comment, /切片/);
});
test('gift wrapping affects cost, requirements, and review', () => {
  const good = fresh(), bad = fresh(); batch(good); batch(bad);
  const a = request(good, 'roll', 'gift'), b = request(bad, 'roll', 'gift'); finish(good, a, 'gift'); finish(bad, b, 'paper');
  assert.equal(good.stats.packaging, 3); assert.equal(bad.stats.packaging, 1);
  assert.ok(good.reviews[0].score > bad.reviews[0].score); assert.match(bad.reviews[0].comment, /礼盒/);
});
test('warming cabinet materially extends freshness', () => {
  const cold = fresh(), warm = fresh(); warm.cash = 1000; g.buyUpgrade(warm, 'warmer'); batch(cold); batch(warm);
  const a = request(cold, 'roll', 'warm'), b = request(warm, 'roll', 'warm');
  g.advance(cold, 65); g.advance(warm, 65); finish(cold, a); finish(warm, b);
  assert.match(cold.reviews[0].comment, /凉/); assert.ok(warm.reviews[0].score > cold.reviews[0].score);
});
test('one-time cancellation returns reserved stock and retains consumed packaging expense', () => {
  const s = fresh(); batch(s); const o = request(s); g.startAssembly(s, o.id); g.packOrder(s, o.id, 'gift');
  const cash = s.cash; assert.equal(s.stock.roll, 5); assert.ok(g.cancelOrder(s, o.id).ok);
  assert.equal(s.stock.roll, 6); assert.equal(s.cash, cash); assert.equal(s.stats.packaging, 3); assert.ok(g.cancelOrder(s, o.id).error); assert.equal(g.validateSave(s), true);
});
test('accepted orders time out without generating revenue', () => {
  const s = fresh(); batch(s); const o = request(s); g.startAssembly(s, o.id); g.packOrder(s, o.id, 'paper');
  const v = s.visitors.find(v => v.id === o.visitorId); v.remaining = 2; o.deadline = s.elapsed + 2;
  g.advance(s, 2); assert.ok(!s.orders.some(t => t.id === o.id)); assert.equal(s.stats.revenue, 0);
  assert.equal(s.stock.roll, 6); assert.equal(v.outcome, 'miss'); assert.ok(s.stats.late > 0);
});
test('preorder reserves a slot and requires six gift-packed products during collection window', () => {
  const s = fresh(); batch(s); assert.ok(g.acceptReservation(s).ok); assert.ok(g.acceptReservation(s).error);
  const o = s.orders[0]; assert.equal(o.quantity, 6); g.startAssembly(s, o.id); g.packOrder(s, o.id, 'gift');
  assert.ok(g.deliverOrder(s, o.id).error); assert.ok(g.openShop(s).ok); g.advance(s, 150);
  assert.ok(s.visitors.some(v => v.name === '预订取货员')); assert.ok(g.deliverOrder(s, o.id).ok);
  assert.equal(s.orderDone, true); assert.equal(s.reservationState, 'done'); assert.equal(s.stats.revenue, 88);
});
test('equipment and employees replace distinct operations, and wages are charged at close', () => {
  const s = fresh(); s.cash = 3000; g.buyUpgrade(s, 'helper'); g.buyUpgrade(s, 'packer'); g.buyUpgrade(s, 'cashier');
  g.prepareBatch(s, 'roll'); g.advance(s, 18); assert.equal(s.stock.roll, 6); assert.equal(s.trays.length + s.jobs.length, 0);
  g.openShop(s); g.advance(s, 6); assert.ok(s.orders.length > 0, 'cashier accepts routine order');
  const o = s.orders[0]; g.startAssembly(s, o.id); g.advance(s, 1); assert.equal(s.orders.length, 0, 'packer packs and cashier hands over');
  assert.equal(s.stats.served, 1); g.closeShop(s); assert.equal(s.lastSummary.expense, 18 + 1 + 8 + 25 + 20 + 20);
});
test('second prep table and oven add real concurrent capacity; slicer automates known request', () => {
  const s = fresh(); s.cash = 3000; g.buyUpgrade(s, 'prep'); g.buyUpgrade(s, 'oven'); g.buyUpgrade(s, 'slicer');
  g.prepareBatch(s, 'roll'); assert.ok(g.prepareBatch(s, 'toast').ok); assert.ok(g.prepareBatch(s, 'croissant').error);
  g.advance(s, 4); for (const t of [...s.trays]) g.loadOven(s, t.id); assert.equal(s.jobs.length, 2);
  g.advance(s, 18); for (const j of [...s.jobs]) g.removeBatch(s, j.id);
  const o = request(s, 'toast', 'slice'); g.startAssembly(s, o.id); assert.equal(o.taskRemaining, 1); g.advance(s, 1); assert.equal(o.sliced, true);
});
test('pause freezes the whole kitchen, expiry and service clock', () => {
  const s = fresh(); batch(s); const o = request(s); g.startAssembly(s, o.id); g.prepareBatch(s, 'toast'); s.paused = true;
  const snapshot = JSON.stringify(s); g.advance(s, 20); assert.equal(JSON.stringify(s), snapshot);
});
test('closing does not create free baked products or settle unfulfilled sales', () => {
  const s = fresh(); g.prepareBatch(s, 'roll'); g.openShop(s); g.closeShop(s);
  assert.equal(s.lastSummary.waste, 6); assert.equal(s.lastSummary.clearance, 0); assert.equal(s.lastSummary.revenue, 0);
  assert.equal(s.cash, 352); assert.equal(s.lastSummary.profit, -26); assert.equal(g.validateSave(s), true);
  const cash = s.cash; assert.ok(g.closeShop(s).error); assert.equal(s.cash, cash);
  const pantry = { ...s.pantry }; g.nextDay(s); assert.deepEqual(s.pantry, pantry); assert.equal(s.phase, 'prep');
});
test('legacy save migration retains money, progression, equipment and paid batches', () => {
  const old = JSON.parse(readFileSync(new URL('./fixtures/v1-save.json', import.meta.url)));
  assert.equal(g.validateSave(old), true); const cash = old.cash; const s = g.hydrateGame(old);
  assert.equal(s.cash, cash); assert.equal(s.day, 5); assert.equal(s.reputation, 38); assert.equal(s.affection.lin, 7); assert.equal(s.upgrades.oven, 1);
  assert.equal(s.jobs.length, 1); assert.equal(s.version, 2); assert.equal(g.validateSave(s), true);
});
test('legacy validation checks the migrated state without altering or trusting malformed ids', () => {
  const old = JSON.parse(readFileSync(new URL('./fixtures/v1-save.json', import.meta.url)));
  const before = JSON.stringify(old); assert.equal(g.validateSave(old), true); assert.equal(JSON.stringify(old), before);
  old.jobs[0].id = '\"><img src=x onerror=alert(1)>';
  assert.equal(g.validateSave(old), false);
});
test('packed and in-progress orders resume without duplicate stock use or payment; bad imports fail', () => {
  const s = fresh(); batch(s); const o = request(s); g.startAssembly(s, o.id); g.packOrder(s, o.id, 'paper');
  const restored = JSON.parse(JSON.stringify(s)); assert.equal(g.validateSave(restored), true); assert.ok(g.deliverOrder(restored, o.id).ok);
  const cash = restored.cash; const again = JSON.parse(JSON.stringify(restored)); assert.equal(g.validateSave(again), true); assert.ok(g.deliverOrder(again, o.id).error); assert.equal(again.cash, cash);
  for (const bad of [null, {}, { ...s, cash: '100' }, { ...s, stock: { ...s.stock, roll: 999 } }, { ...s, orders: [{ id: 1 }] }, { ...s, jobs: [{ id: 1 }] }, { ...s, menu: [] }]) assert.equal(g.validateSave(bad), false);
});
test('low cash and empty pantry have a recoverable next day', () => {
  const s = fresh(); g.prepareBatch(s, 'roll'); g.openShop(s); g.closeShop(s); s.cash = 65; s.pantry = { flour: 0, butter: 0, milk: 0 }; g.nextDay(s);
  assert.ok(s.cash >= 65); assert.ok(g.prepareBatch(s, s.menu[0]).ok);
});
test('ten active days maintain inventory, orders, and valid saves', () => {
  const s = fresh();
  for (let day = 0; day < 10; day++) {
    if (!g.prepareBatch(s, 'roll').ok) for (const i of g.INGREDIENTS) if (s.pantry[i.id] < g.getProduct('roll').ingredients[i.id]) g.buyIngredient(s, i.id);
    if (!s.trays.length) g.prepareBatch(s, 'roll'); g.advance(s, 4); g.loadOven(s, s.trays[0].id); g.advance(s, 14); g.removeBatch(s, s.jobs[0].id); g.openShop(s);
    for (let sec = 0; sec < 270; sec++) {
      for (const v of s.visitors) if (v.stage === 'waiting' && s.orders.length < 3) { g.askVisitor(s, v.id); if (v.requested !== 'roll') g.recommendVisitor(s, v.id, 'roll'); g.acceptOrder(s, v.id); }
      for (const o of [...s.orders]) {
        if (o.stage === 'accepted' && s.stock[o.product] >= o.quantity) g.startAssembly(s, o.id);
        if (o.stage === 'assembling' && !o.task) g.packOrder(s, o.id, o.need === 'gift' ? 'gift' : 'paper');
        if (o.stage === 'packed') g.deliverOrder(s, o.id);
      }
      if (!s.trays.length && s.stock.roll < 9) g.prepareBatch(s, 'roll');
      for (const t of [...s.trays]) if (!t.remaining) g.loadOven(s, t.id);
      for (const j of [...s.jobs]) if (j.elapsed >= j.duration) g.removeBatch(s, j.id);
      g.advance(s); assert.equal(g.validateSave(s), true, `day ${day + 1} second ${sec}`);
      assert.ok(g.occupied(s) <= g.capacity(s)); assert.ok(Object.values(s.stock).every(n => n >= 0));
    }
    assert.equal(s.phase, 'closed'); g.nextDay(s);
  }
  assert.equal(s.day, 11); assert.ok(s.totalServed > 10); assert.ok(s.totalRevenue > 100);
});

test('recipe mastery unlocks better production without repricing accepted orders', () => {
  const s = fresh(); batch(s); const o = request(s); const quoted = o.quote;
  assert.ok(g.improveRecipe(s, 'roll').error); s.mastery.roll = 6;
  const before = s.cash; assert.ok(g.improveRecipe(s, 'roll').ok); assert.equal(s.cash, before - 80);
  assert.equal(g.sellingPrice(s, 'roll'), 11); assert.equal(g.bakeDuration(s, 'roll'), 12); assert.equal(o.quote, quoted);
  finish(s, o); assert.equal(s.mastery.roll, 7); assert.ok(g.improveRecipe(s, 'roll').error);
  s.mastery.roll = 18; s.cash = 1000; assert.ok(g.improveRecipe(s, 'roll').ok);
  assert.equal(g.sellingPrice(s, 'roll'), 13); assert.equal(g.bakeDuration(s, 'roll'), 10); assert.ok(g.improveRecipe(s, 'roll').error);
  assert.equal(g.validateSave(s), true);
});
test('community calendar changes actual sharing orders and gift requirements', () => {
  const s = fresh(); s.day = 7; batch(s); g.openShop(s); g.advance(s, 70);
  assert.equal(g.dayEvent(s).title, '周末下午茶');
  const sharing = s.visitors.filter(v => !v.regular);
  assert.ok(sharing.length > 0); assert.ok(sharing.every(v => v.quantity === 2 && v.need === 'gift'));
  assert.ok(sharing.every(v => v.budget >= g.sellingPrice(s, v.requested) * 2 + 4));
});
test('cake decoration is a timed cost and the selected topping changes review', () => {
  const good = fresh(), bad = fresh();
  for (const s of [good, bad]) { s.cash = 1000; s.reputation = 50; g.research(s, 'cake'); g.toggleMenu(s, 'croissant'); g.toggleMenu(s, 'cake'); batch(s, 'cake'); }
  const a = request(good, 'cake', 'decorate'), b = request(bad, 'cake', 'decorate');
  for (const [s, o, topping] of [[good, a, 'berry'], [bad, b, 'cream']]) {
    g.startAssembly(s, o.id); assert.ok(g.decorateOrder(s, o.id, topping).ok); assert.ok(g.packOrder(s, o.id, 'paper').error);
    g.advance(s, 3); g.packOrder(s, o.id, 'paper'); g.deliverOrder(s, o.id);
  }
  assert.equal(good.stats.packaging, 2); assert.ok(good.reviews[0].score > bad.reviews[0].score); assert.match(bad.reviews[0].comment, /装饰/);
});
test('declining before accepting preserves reputation; expired preorder never pays', () => {
  const s = fresh(); batch(s); g.openShop(s); g.advance(s, 6); const rep = s.reputation;
  assert.ok(g.declineVisitor(s, s.visitors[0].id).ok); assert.equal(s.reputation, rep); assert.equal(s.stats.declined, 1);
  g.acceptReservation(s); g.advance(s, 204);
  assert.equal(s.reservationState, 'failed'); assert.equal(s.stats.revenue, 0); assert.ok(s.stats.late > 0); assert.equal(g.validateSave(s), true);
});
test('signature orders still respect budget and discounted recommendation', () => {
  const s = fresh(); s.recipeLevels.roll = 2; s.mastery.roll = 18; batch(s); g.openShop(s); g.advance(s, 6);
  const v = s.visitors[0]; assert.ok(g.acceptOrder(s, v.id).error); s.discount = true;
  assert.ok(g.recommendVisitor(s, v.id, 'roll').ok); assert.ok(g.acceptOrder(s, v.id).ok); assert.equal(s.orders[0].quote, 10);
});
test('late-day promises and wait extensions never exceed closing time', () => {
  const s = fresh(); batch(s); g.openShop(s); g.advance(s, 239);
  const v = s.visitors.find(v => v.stage === 'waiting'); assert.ok(v);
  v.requested = 'roll'; v.need = 'plain'; v.remaining = 100; v.duration = 100; assert.ok(g.acceptOrder(s, v.id).ok);
  const o = s.orders.find(o => o.visitorId === v.id);
  assert.equal(o.deadline, 270); assert.equal(v.remaining, 31);
  g.waitVisitor(s, v.id); assert.equal(o.deadline, 270); assert.equal(v.remaining, 31);
  g.advance(s, 31); assert.equal(s.phase, 'closed'); assert.equal(s.orders.length, 0); assert.equal(g.validateSave(s), true);
});
test('legacy unscored visits do not dilute new customer ratings after migration', () => {
  const old = JSON.parse(readFileSync(new URL('./fixtures/v1-save.json', import.meta.url)));
  old.stats.served = 14; old.totalServed = 14; const s = g.hydrateGame(old);
  assert.equal(s.stats.ratedCount, 0); s.jobs = []; batch(s); const o = request(s); finish(s, o);
  assert.equal(s.stats.ratedCount, 1); assert.equal(s.stats.qualityTotal, s.reviews[0].score);
  g.closeShop(s); assert.equal(s.lastSummary.average, s.reviews[0].score); assert.equal(g.validateSave(s), true);
});
