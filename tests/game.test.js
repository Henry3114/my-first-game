import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, bake, advance, openShop, closeShop, nextDay, fulfillOrder, buyUpgrade, research, capacity, occupied, PRODUCTS, validateSave, hydrateGame, greetVisitor, waitVisitor, recommendVisitor, serveVisitor } from '../game.js';

test('new shop starts directly without a tutorial', () => {
  const s = createGame(42);
  assert.equal(s.phase, 'prep'); assert.equal(s.cash, 360); assert.equal(s.day, 1);
  assert.equal(s.unlocked.length, 3); assert.equal(validateSave(s), true);
  assert.match(openShop(s).error, /先烤/);
});
test('baking reserves capacity and charges ingredients once', () => {
  const s = createGame(42);
  assert.ok(bake(s, 'roll').ok); assert.equal(s.cash, 342); assert.equal(s.stats.expense, 18);
  assert.equal(occupied(s), 6); assert.match(bake(s, 'toast').error, /烤箱正忙/);
  advance(s, 7);
  assert.equal(s.stock.roll, 6); assert.equal(s.jobs.length, 0);
  assert.equal(s.minute, 540); assert.equal(s.cash, 342);
});
test('shelf limits count displayed and baking products', () => {
  const s = createGame(5); s.stock.toast = capacity(s) - 6;
  assert.ok(bake(s, 'roll').ok); advance(s, 7);
  assert.equal(occupied(s), capacity(s)); assert.match(bake(s, 'roll').error, /展示柜/);
});
test('orders remove six items, grant once and increase reputation', () => {
  const s = createGame(42);
  assert.ok(fulfillOrder(s).error); bake(s, 'roll'); advance(s, 7);
  assert.ok(fulfillOrder(s).ok); assert.equal(s.stock.roll, 0); assert.equal(s.cash, 430);
  assert.equal(s.reputation, 23); assert.equal(s.stats.sold, 6);
  assert.ok(fulfillOrder(s).error); assert.equal(s.cash, 430);
});
test('customers buy actual stock; a full day settles exactly once', () => {
  const s = createGame(123); s.stock.roll = 18; s.stock.toast = 18;
  assert.ok(openShop(s).ok); advance(s, 108);
  assert.equal(s.phase, 'closed'); assert.equal(s.minute, 1080);
  assert.ok(s.stats.served > 0); assert.ok(s.stats.sold > 0); assert.ok(s.stats.revenue > 0);
  assert.equal(s.history.length, 1); assert.ok(Object.values(s.stock).every(n => n === 0));
  assert.equal(s.cash, 360 + s.lastSummary.profit);
  const cash = s.cash; assert.ok(closeShop(s).error); assert.equal(s.cash, cash);
});
test('close clears paid batches without double charging; next day resets daily state', () => {
  const s = createGame(42); bake(s, 'roll'); openShop(s); closeShop(s);
  assert.equal(s.jobs.length, 0); assert.equal(s.lastSummary.waste, 6);
  assert.equal(s.lastSummary.clearance, 12); assert.equal(s.lastSummary.expense, 26);
  assert.equal(s.lastSummary.profit, -14); assert.equal(s.cash, 346);
  assert.ok(nextDay(s).ok); assert.equal(s.day, 2); assert.equal(s.phase, 'prep');
  assert.equal(s.minute, 540); assert.equal(s.orderDone, false); assert.equal(s.stats.revenue, 0);
});
test('pause freezes time and baking', () => {
  const s = createGame(42); bake(s, 'toast'); openShop(s); s.paused = true;
  const snapshot = JSON.stringify(s); advance(s, 20); assert.equal(JSON.stringify(s), snapshot);
});
test('upgrades and research enforce cost, limits and reputation', () => {
  const s = createGame(42);
  assert.ok(buyUpgrade(s, 'oven').ok); assert.equal(s.cash, 180); assert.equal(s.upgrades.oven, 1);
  assert.ok(buyUpgrade(s, 'oven').error); assert.ok(research(s, 'cinnamon').error);
  s.reputation = 28; assert.ok(research(s, 'cinnamon').ok); assert.equal(s.cash, 80);
  assert.ok(s.unlocked.includes('cinnamon')); assert.ok(research(s, 'cinnamon').error);
  assert.ok(bake(s, 'roll').ok); assert.ok(bake(s, 'toast').ok); assert.equal(s.jobs.length, 2);
});
test('daily reward and helper wages settle once', () => {
  const s = createGame(42); s.cash = 1000; buyUpgrade(s, 'helper');
  bake(s, 'roll'); assert.equal(s.jobs[0].duration, 5);
  openShop(s); s.stats.revenue = 160; closeShop(s);
  assert.equal(s.lastSummary.bonus, 40); assert.equal(s.lastSummary.expense, 18 + 8 + 25);
});
test('save resumes batches; malformed saves are rejected', () => {
  const s = createGame(42); bake(s, 'roll'); advance(s, 3);
  const restored = JSON.parse(JSON.stringify(s)); assert.equal(validateSave(restored), true);
  advance(restored, 4); assert.equal(restored.stock.roll, 6); assert.equal(restored.cash, 342);
  for (const bad of [null, {}, { ...s, cash: '360' }, { ...s, jobs: [{ product: 'madeup' }] }, { ...s, stock: { roll: -1 } }, { ...s, upgrades: { ...s.upgrades, oven: 100 } }]) assert.equal(validateSave(bad), false);
});
test('cash shortage is recoverable next day', () => {
  const s = createGame(42); bake(s, 'roll'); openShop(s); s.cash = 0; closeShop(s); nextDay(s);
  assert.equal(s.cash, 60); assert.ok(bake(s, 'roll').ok);
});
test('30 days preserve economic, save and inventory invariants', () => {
  const s = createGame(23456);
  for (let day = 0; day < 30; day++) {
    const p = PRODUCTS[(s.day - 1) % 3];
    bake(s, p.id); advance(s, p.time); fulfillOrder(s); bake(s, 'roll'); openShop(s);
    for (let second = 0; second < 108; second++) {
      if (!s.jobs.length && occupied(s) < 18 && s.cash >= 48) bake(s, ['roll', 'toast', 'croissant'][Math.floor(second / 7) % 3]);
      advance(s); assert.ok(Object.values(s.stock).every(n => n >= 0));
      assert.ok(occupied(s) <= capacity(s)); assert.equal(validateSave(s), true);
    }
    assert.equal(s.phase, 'closed'); assert.ok(nextDay(s).ok);
  }
  assert.equal(s.day, 31); assert.equal(s.history.length, 30);
  assert.ok(s.totalRevenue > 1000); assert.ok(s.totalServed > 100);
});

test('a visitor enters, browses, waits, pays once, then leaves with the purchase', () => {
  const s = createGame(42); s.stock.roll = 6; openShop(s);
  const id = s.visitors[0].id;
  const visitor = () => s.visitors.find(v => v.id === id);
  assert.equal(visitor().stage, 'arriving');
  assert.equal(s.cash, 360);
  advance(s, 3); assert.equal(visitor().stage, 'browsing');
  advance(s, 3); assert.equal(visitor().stage, 'waiting');
  assert.equal(s.cash, 360); assert.equal(s.stock.roll, 6);
  assert.ok(serveVisitor(s, id).ok);
  const sale = visitor().paidAmount, quantity = visitor().quantity;
  assert.equal(visitor().stage, 'paying'); assert.equal(s.stock.roll, 6 - quantity);
  assert.equal(s.cash, 360 + sale);
  assert.ok(serveVisitor(s, id).error); assert.equal(s.cash, 360 + sale);
  advance(s, 2); assert.equal(visitor().stage, 'leaving');
  assert.equal(s.cash, 360 + sale);
  advance(s, 4); assert.equal(visitor(), undefined);
});

test('greeting, waiting and recommending have bounded effects on the actual sale', () => {
  const s = createGame(42); s.stock.toast = 6; openShop(s); advance(s, 6);
  const v = s.visitors[0], id = v.id;
  assert.equal(v.requested, 'roll');
  assert.ok(serveVisitor(s, id).error, 'cannot sell a missing favorite without recommendation');
  const patience = v.remaining;
  assert.ok(greetVisitor(s, id).ok); assert.equal(v.remaining, patience + 2);
  assert.ok(greetVisitor(s, id).error);
  assert.ok(waitVisitor(s, id).ok); assert.equal(v.remaining, patience + 12);
  assert.ok(waitVisitor(s, id).error);
  assert.ok(recommendVisitor(s, id, 'cake').error);
  assert.ok(recommendVisitor(s, id, 'toast').ok);
  assert.ok(recommendVisitor(s, id, 'toast').error);
  assert.ok(serveVisitor(s, id).ok);
  assert.equal(v.selected, 'toast'); assert.equal(v.tip, 2);
  assert.equal(v.paidAmount, v.quantity * 16 + 2);
  assert.equal(s.cash, 360 + v.paidAmount);
  assert.equal(s.affection.yu, 2);
});

test('unavailable products cause a visible departure rather than a phantom purchase', () => {
  const s = createGame(42); bake(s, 'roll'); openShop(s);
  // A real production job permits opening; remove stock after it comes out.
  advance(s, 7); s.stock.roll = 0;
  const v = s.visitors[0];
  const cash = s.cash;
  advance(s, 6);
  assert.equal(v.outcome, 'miss'); assert.equal(v.stage, 'leaving');
  assert.equal(v.paidAmount, 0); assert.equal(s.cash, cash);
  assert.ok(s.stats.missed > 0);
});

test('waiting and paid customers restore without duplication; old saves retain progress', () => {
  const s = createGame(42); s.stock.roll = 12; openShop(s); advance(s, 6);
  const waiting = JSON.parse(JSON.stringify(s));
  assert.equal(validateSave(waiting), true);
  const id = waiting.visitors[0].id;
  serveVisitor(waiting, id);
  const paid = JSON.parse(JSON.stringify(waiting)), cash = paid.cash;
  assert.equal(validateSave(paid), true);
  assert.ok(serveVisitor(paid, id).error);
  // End trading now: a paid visitor must not be settled for a second time.
  paid.visitors = paid.visitors.filter(v => v.id === id);
  closeShop(paid);
  assert.equal(paid.cash, cash + paid.lastSummary.clearance + paid.lastSummary.bonus - 8);
  const legacy = createGame(7); legacy.day = 9; legacy.cash = 1234; delete legacy.visitors;
  assert.equal(validateSave(legacy), true);
  hydrateGame(legacy); assert.equal(legacy.day, 9); assert.equal(legacy.cash, 1234);
  assert.deepEqual(legacy.visitors, []);
  const bad = JSON.parse(JSON.stringify(s)); bad.visitors[0].stage = 'unknown';
  assert.equal(validateSave(bad), false);
});
