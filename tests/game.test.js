import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, bake, advance, openShop, closeShop, nextDay, fulfillOrder, buyUpgrade, research, capacity, occupied, PRODUCTS, validateSave } from '../game.js';

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
