export const PRODUCTS = [
  { id: 'roll', name: '奶油餐包', en: 'Butter roll', price: 10, cost: 18, time: 7, description: '柔软蓬松，藏着一小块黄油的香气。', unlock: 0, research: 0, audience: '学生喜爱' },
  { id: 'toast', name: '牛奶吐司', en: 'Milk toast', price: 16, cost: 30, time: 10, description: '烤得金黄的日常，带回家慢慢分享。', unlock: 0, research: 0, audience: '街坊喜爱' },
  { id: 'croissant', name: '黄油可颂', en: 'Croissant', price: 22, cost: 48, time: 13, description: '层层酥香，一口就能听见清脆。', unlock: 0, research: 0, audience: '上班族喜爱' },
  { id: 'cinnamon', name: '肉桂卷', en: 'Cinnamon roll', price: 25, cost: 54, time: 12, description: '温暖的肉桂香，和午后很相配。', unlock: 28, research: 100, audience: '甜点客喜爱' },
  { id: 'cake', name: '草莓小蛋糕', en: 'Strawberry cake', price: 36, cost: 78, time: 16, description: '把一点点庆祝，放进平凡的日子。', unlock: 42, research: 180, audience: '庆祝首选' },
  { id: 'tart', name: '柠檬塔', en: 'Lemon tart', price: 32, cost: 66, time: 14, description: '酸甜恰到好处，像阳光落在舌尖。', unlock: 58, research: 240, audience: '甜点客喜爱' },
];
export const WEATHER = [
  { name: '晴朗', label: '阳光正好，街上热闹了些', icon: 'sun', interval: 3, preference: 'roll' },
  { name: '小雨', label: '雨天客人少些，热面包更受欢迎', icon: 'rain', interval: 5, preference: 'toast' },
  { name: '多云', label: '适合散步，也适合一份甜点', icon: 'cloud', interval: 4, preference: 'croissant' },
];
export const UPGRADES = [
  { id: 'oven', name: '烤箱扩容', description: '每级多一个烤位，最多同时烤 3 炉。', price: 180, max: 2, icon: 'oven' },
  { id: 'counter', name: '大一点的展示柜', description: '每级增加 18 个陈列位，容得下更多美味。', price: 120, max: 3, icon: 'shop' },
  { id: 'sign', name: '街角新招牌', description: '每级吸引更多客人，提升进店频率。', price: 160, max: 2, icon: 'sparkles' },
  { id: 'helper', name: '请一位烘焙帮手', description: '烘焙耗时减少 35%，每日工资 ¥25。', price: 220, max: 1, icon: 'people' },
];
export const REGULARS = [
  { id: 'lin', name: '林奶奶', initial: '林', favorite: 'toast', tag: '总爱买一份牛奶吐司', color: '#d7b6a5', stories: ['“这香味，让我想起以前家门口的店。”', '“老伴说，明天还想吃你家的吐司。”', '“以后周末的早餐，就拜托你啦。”'] },
  { id: 'yu', name: '小雨', initial: '雨', favorite: 'roll', tag: '放学路过的学生', color: '#a7b7aa', stories: ['“放学后最期待的，就是这里的面包！”', '“我把这家店推荐给同学啦。”', '“等妈妈生日，我想来订一个蛋糕。”'] },
];

export const getProduct = id => PRODUCTS.find(p => p.id === id);
export const capacity = s => 36 + s.upgrades.counter * 18;
export const occupied = s => Object.values(s.stock).reduce((a, b) => a + b, 0) + s.jobs.reduce((a, j) => a + j.quantity, 0);
export const weatherFor = s => WEATHER[(s.day - 1) % WEATHER.length];
export const reputationLabel = s => s.reputation >= 70 ? '社区人气名店' : s.reputation >= 42 ? '街坊口碑小店' : s.reputation >= 28 ? '渐有名气' : '街角新店';
export const dailyTarget = s => Math.min(300, 140 + (s.day - 1) * 20);
export const upgradeCost = (s, u) => u.price * (s.upgrades[u.id] + 1);
const dailyStats = () => ({ revenue: 0, expense: 0, sold: 0, served: 0, missed: 0, waste: 0, bonus: 0 });

export function createGame(seed = Date.now() % 2147483647 || 7) {
  return {
    version: 1, day: 1, cash: 360, reputation: 20, phase: 'prep', minute: 540,
    stock: Object.fromEntries(PRODUCTS.map(p => [p.id, 0])), jobs: [],
    unlocked: ['roll', 'toast', 'croissant'], upgrades: { oven: 0, counter: 0, sign: 0, helper: 0 },
    affection: { lin: 0, yu: 0 }, stats: dailyStats(), totalRevenue: 0, totalServed: 0,
    orderDone: false, discount: false, paused: false, rng: seed, elapsed: 0, nextId: 1,
    events: [], history: [], theme: 'sage', lastSummary: null,
  };
}

function random(s) {
  s.rng = (s.rng * 16807) % 2147483647;
  return s.rng / 2147483647;
}
function event(s, text, type = 'note') {
  s.events.unshift({ id: s.nextId++, text, type, minute: s.minute, day: s.day });
  s.events = s.events.slice(0, 30);
}
function income(s, amount) {
  s.cash += amount; s.stats.revenue += amount; s.totalRevenue += amount;
}
function rep(s, n) { s.reputation = Math.max(0, Math.min(100, s.reputation + n)); }

export function bake(s, id) {
  const p = getProduct(id);
  if (!p || !s.unlocked.includes(id)) return { error: '这款配方还没有解锁。' };
  if (s.phase === 'closed') return { error: '今天已打烊，明天再烤吧。' };
  if (s.jobs.length >= 1 + s.upgrades.oven) return { error: '烤箱正忙，等这一炉出炉再来。' };
  if (occupied(s) + 6 > capacity(s)) return { error: '展示柜快满了，卖出一些或升级展示柜吧。' };
  if (s.cash < p.cost) return { error: '零钱不够，可以先出售现有面包，或接一份街坊订单。' };
  s.cash -= p.cost; s.stats.expense += p.cost;
  const duration = Math.ceil(p.time * (s.upgrades.helper ? 0.65 : 1));
  s.jobs.push({ id: s.nextId++, product: id, quantity: 6, remaining: duration, duration });
  event(s, `一炉${p.name}进烤箱啦，期待热乎乎的出炉。`, 'bake');
  return { ok: true };
}

export function openShop(s) {
  if (s.phase !== 'prep') return { error: '现在不能开门。' };
  if (!occupied(s)) return { error: '先烤一炉面包，再迎接今天的客人吧。' };
  s.phase = 'open'; s.elapsed = 0;
  event(s, '翻开营业牌，新的一天开始了。', 'open');
  return { ok: true };
}

function customer(s) {
  const regular = random(s) < 0.3 ? REGULARS[Math.floor(random(s) * REGULARS.length)] : null;
  const audiences = [
    { name: '学生', favorites: ['roll', 'toast'] },
    { name: '上班族', favorites: ['croissant', 'toast'] },
    { name: '甜点爱好者', favorites: ['cake', 'tart', 'cinnamon', 'croissant'] },
  ];
  const audience = audiences[Math.floor(random(s) * audiences.length)];
  const favorites = regular ? [regular.favorite] : random(s) < 0.35 ? [weatherFor(s).preference, ...audience.favorites] : audience.favorites;
  const stocked = PRODUCTS.filter(p => s.stock[p.id] > 0);
  let chosen = favorites.map(getProduct).find(p => p && s.stock[p.id] > 0);
  if (!chosen && stocked.length && random(s) < (s.discount ? 0.95 : 0.65)) chosen = stocked[Math.floor(random(s) * stocked.length)];
  if (!chosen) {
    s.stats.missed++;
    if (s.stats.missed % 3 === 0) rep(s, -1);
    const wanted = getProduct(favorites[0]);
    event(s, `${regular?.name || audience.name}没买到${wanted.name}，有些遗憾地离开了。`, 'miss');
    return;
  }
  const quantity = Math.min(s.stock[chosen.id], random(s) < 0.35 ? 2 : 1);
  const price = Math.round(chosen.price * (s.discount ? 0.8 : 1)) * quantity;
  s.stock[chosen.id] -= quantity; income(s, price);
  s.stats.sold += quantity; s.stats.served++; s.totalServed++;
  if (s.stats.served % 3 === 0) rep(s, 1);
  if (regular && chosen.id === regular.favorite) {
    s.affection[regular.id]++;
    const level = Math.min(2, Math.floor((s.affection[regular.id] - 1) / 4));
    event(s, `${regular.name}买了${chosen.name}。${regular.stories[level]}`, 'regular');
  } else event(s, `${regular?.name || audience.name}带走了 ${quantity} 份${chosen.name}，收入 ¥${price}。`, 'sale');
}

export function advance(s, seconds = 1) {
  if (s.paused || s.phase === 'closed') return;
  for (let i = 0; i < seconds; i++) {
    for (const j of s.jobs) j.remaining--;
    const finished = s.jobs.filter(j => j.remaining <= 0);
    for (const j of finished) {
      s.stock[j.product] += j.quantity;
      event(s, `${getProduct(j.product).name}出炉！${j.quantity} 份新鲜上架。`, 'ready');
    }
    s.jobs = s.jobs.filter(j => j.remaining > 0);
    if (s.phase === 'open') {
      s.minute += 5; s.elapsed++;
      const interval = Math.max(2, weatherFor(s).interval - s.upgrades.sign - (s.day % 7 === 0 ? 1 : 0));
      if (s.elapsed % interval === 0) customer(s);
      if (s.minute >= 1080) { closeShop(s); break; }
    }
  }
}

export function orderFor(s) {
  const items = ['roll', 'toast', 'croissant'];
  const product = items[(s.day - 1) % items.length];
  const p = getProduct(product);
  return { product, quantity: 6, reward: p.price * 6 + 28, name: ['小雨的课间分享', '林奶奶的早餐篮', '街坊办公室茶歇'][(s.day - 1) % 3] };
}

export function fulfillOrder(s) {
  if (s.phase === 'closed') return { error: '今天打烊了，明天再来接单吧。' };
  if (s.orderDone) return { error: '今天的预订已经完成啦。' };
  const o = orderFor(s);
  if (s.stock[o.product] < o.quantity) return { error: `还需要 ${o.quantity - s.stock[o.product]} 份${getProduct(o.product).name}，出炉后再交付吧。` };
  s.stock[o.product] -= o.quantity; s.orderDone = true;
  income(s, o.reward); s.stats.sold += o.quantity; rep(s, 3);
  const id = s.day % 3 === 1 ? 'yu' : 'lin'; s.affection[id]++;
  event(s, `完成「${o.name}」，收到 ¥${o.reward} 和一份暖心的感谢。`, 'regular');
  return { ok: true };
}

export function buyUpgrade(s, id) {
  const u = UPGRADES.find(u => u.id === id);
  if (!u || s.upgrades[id] >= u.max) return { error: '这项升级已经完成了。' };
  const cost = upgradeCost(s, u);
  if (s.cash < cost) return { error: `还差 ¥${cost - s.cash}，再经营一会儿吧。` };
  s.cash -= cost; s.upgrades[id]++;
  event(s, `${u.name}升级完成，小店又向前了一步。`, 'upgrade');
  return { ok: true };
}

export function research(s, id) {
  const p = getProduct(id);
  if (!p || s.unlocked.includes(id)) return { error: '已经掌握这份配方啦。' };
  if (s.reputation < p.unlock) return { error: `口碑达到 ${p.unlock} 后，可以研发这款新品。` };
  if (s.cash < p.research) return { error: `研发还需要 ¥${p.research - s.cash}。` };
  s.cash -= p.research; s.unlocked.push(id);
  event(s, `${p.name}研发成功！现在可以加入今日菜单了。`, 'upgrade');
  return { ok: true };
}

export function closeShop(s) {
  if (s.phase !== 'open') return { error: '还没有开始营业。' };
  // Finish paid batches before clearance, so no ingredients or cash vanish silently.
  for (const j of s.jobs) s.stock[j.product] += j.quantity;
  s.jobs = [];
  const remaining = Object.values(s.stock).reduce((a, b) => a + b, 0);
  const clearance = PRODUCTS.reduce((total, p) => total + s.stock[p.id] * Math.floor(p.price * 0.25), 0);
  const expenses = 8 + (s.upgrades.helper ? 25 : 0);
  const goalMet = s.stats.revenue >= dailyTarget(s);
  s.stats.bonus = goalMet ? 40 : 0;
  s.cash += clearance + s.stats.bonus - expenses;
  s.stats.expense += expenses;
  s.stats.waste = remaining;
  s.stock = Object.fromEntries(PRODUCTS.map(p => [p.id, 0]));
  s.phase = 'closed'; s.minute = Math.min(s.minute, 1080); s.paused = false;
  if (goalMet) rep(s, 2);
  s.lastSummary = { ...s.stats, day: s.day, clearance, profit: s.stats.revenue + clearance + s.stats.bonus - s.stats.expense, goalMet, early: s.minute < 1080 };
  s.history.unshift(s.lastSummary); s.history = s.history.slice(0, 30);
  event(s, `今天打烊啦。服务 ${s.stats.served} 位客人，明天也要热气腾腾。`, 'close');
  return { ok: true };
}

export function nextDay(s) {
  if (s.phase !== 'closed') return { error: '先完成今天的营业吧。' };
  s.day++; s.phase = 'prep'; s.minute = 540; s.elapsed = 0;
  s.stats = dailyStats(); s.orderDone = false; s.discount = false; s.lastSummary = null;
  // A small, visible community advance prevents a save from becoming unplayable.
  if (s.cash < 18) {
    const aid = 60 - s.cash; s.cash = 60;
    event(s, `街坊互助金送来 ¥${aid}，先烤一炉面包重新出发吧。`, 'regular');
  }
  event(s, `第 ${s.day} 天，${weatherFor(s).name}。${weatherFor(s).label}。`, 'note');
  return { ok: true };
}

export function validateSave(raw) {
  if (!raw || raw.version !== 1) return false;
  const numeric = ['day', 'cash', 'reputation', 'minute', 'rng', 'elapsed', 'nextId', 'totalRevenue', 'totalServed'];
  if (!numeric.every(k => Number.isFinite(raw[k]))) return false;
  if (!Number.isInteger(raw.day) || raw.day < 1 || raw.reputation < 0 || raw.reputation > 100 || !Number.isInteger(raw.rng) || raw.rng <= 0 || raw.rng >= 2147483647 || raw.minute < 540 || raw.minute > 1080) return false;
  if (!['prep', 'open', 'closed'].includes(raw.phase) || !['sage', 'rose', 'sand'].includes(raw.theme)) return false;
  if (!Array.isArray(raw.unlocked) || !['roll', 'toast', 'croissant'].every(id => raw.unlocked.includes(id)) || raw.unlocked.some(id => !getProduct(id))) return false;
  if (!raw.stock || !PRODUCTS.every(p => Number.isInteger(raw.stock[p.id]) && raw.stock[p.id] >= 0)) return false;
  if (!raw.upgrades || !UPGRADES.every(u => Number.isInteger(raw.upgrades[u.id]) && raw.upgrades[u.id] >= 0 && raw.upgrades[u.id] <= u.max)) return false;
  if (!raw.affection || !REGULARS.every(r => Number.isInteger(raw.affection[r.id]) && raw.affection[r.id] >= 0)) return false;
  if (!raw.stats || !Object.keys(dailyStats()).every(k => Number.isFinite(raw.stats[k]) && raw.stats[k] >= 0)) return false;
  if (!Array.isArray(raw.jobs) || raw.jobs.length > 3 || raw.jobs.some(j => !getProduct(j.product) || !raw.unlocked.includes(j.product) || j.quantity !== 6 || !Number.isFinite(j.duration) || j.duration <= 0 || !Number.isFinite(j.remaining) || j.remaining <= 0 || j.remaining > j.duration)) return false;
  if (!Array.isArray(raw.events) || raw.events.length > 30 || raw.events.some(e => typeof e.text !== 'string' || typeof e.type !== 'string' || !Number.isFinite(e.minute) || !Number.isFinite(e.day))) return false;
  if (!Array.isArray(raw.history) || raw.history.length > 30 || raw.history.some(h => !['day', 'revenue', 'expense', 'clearance', 'bonus', 'profit', 'served', 'missed', 'sold', 'waste'].every(k => Number.isFinite(h[k])))) return false;
  if (raw.phase === 'closed' && (!raw.lastSummary || !['day', 'revenue', 'expense', 'clearance', 'bonus', 'profit', 'served', 'missed', 'sold', 'waste'].every(k => Number.isFinite(raw.lastSummary[k])))) return false;
  return typeof raw.paused === 'boolean' && typeof raw.discount === 'boolean' && typeof raw.orderDone === 'boolean';
}
