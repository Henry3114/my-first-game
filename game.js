export const PRODUCTS = [
  { id: 'roll', name: '奶油餐包', en: 'Butter roll', price: 10, cost: 18, time: 14, ingredients: { flour: 3, butter: 2, milk: 2 }, description: '柔软蓬松，藏着一小块黄油的香气。', unlock: 0, research: 0, audience: '学生喜爱' },
  { id: 'toast', name: '牛奶吐司', en: 'Milk toast', price: 16, cost: 30, time: 18, ingredients: { flour: 5, butter: 3, milk: 4 }, description: '烤得金黄的日常，带回家慢慢分享。', unlock: 0, research: 0, audience: '街坊喜爱' },
  { id: 'croissant', name: '黄油可颂', en: 'Croissant', price: 22, cost: 48, time: 22, ingredients: { flour: 6, butter: 8, milk: 2 }, description: '层层酥香，一口就能听见清脆。', unlock: 0, research: 0, audience: '上班族喜爱' },
  { id: 'cinnamon', name: '肉桂卷', en: 'Cinnamon roll', price: 25, cost: 54, time: 20, ingredients: { flour: 6, butter: 8, milk: 5 }, description: '温暖的肉桂香，和午后很相配。', unlock: 28, research: 100, audience: '甜点客喜爱' },
  { id: 'cake', name: '草莓小蛋糕', en: 'Strawberry cake', price: 36, cost: 78, time: 24, ingredients: { flour: 6, butter: 9, milk: 15 }, description: '把一点点庆祝，放进平凡的日子。', unlock: 42, research: 180, audience: '庆祝首选' },
  { id: 'tart', name: '柠檬塔', en: 'Lemon tart', price: 32, cost: 66, time: 22, ingredients: { flour: 5, butter: 10, milk: 8 }, description: '酸甜恰到好处，像阳光落在舌尖。', unlock: 58, research: 240, audience: '甜点客喜爱' },
];
export const WEATHER = [
  { name: '晴朗', label: '阳光正好，街上热闹了些', icon: 'sun', interval: 18, preference: 'roll' },
  { name: '小雨', label: '雨天客人少些，热面包更受欢迎', icon: 'rain', interval: 24, preference: 'toast' },
  { name: '多云', label: '适合散步，也适合一份甜点', icon: 'cloud', interval: 20, preference: 'croissant' },
];
export const UPGRADES = [
  { id: 'oven', name: '烤箱扩容', description: '每级多一个烤位，最多同时烤 3 炉。', price: 180, max: 2, icon: 'oven' },
  { id: 'prep', name: '第二张备料台', description: '可同时准备两盘面团，不必等上一盘装炉。', price: 140, max: 1, icon: 'oven' },
  { id: 'slicer', name: '自动切片机', description: '已确认切片需求的吐司上台后，1 秒自动切好。', price: 160, max: 1, icon: 'sparkles' },
  { id: 'warmer', name: '保温展示柜', description: '新鲜温热区间从 60 秒延长到 120 秒。', price: 180, max: 1, icon: 'sun' },
  { id: 'packer', name: '包装助手', description: '自动包装出餐台上的普通纸袋订单；工资 ¥20/天。', price: 240, max: 1, icon: 'gift' },
  { id: 'cashier', name: '前台店员', description: '自动接常规订单、交付已包装的订单；工资 ¥20/天。', price: 260, max: 1, icon: 'people' },
  { id: 'counter', name: '大一点的展示柜', description: '每级增加 18 个陈列位，容得下更多美味。', price: 120, max: 3, icon: 'shop' },
  { id: 'sign', name: '街角新招牌', description: '每级吸引更多客人，提升进店频率。', price: 160, max: 2, icon: 'sparkles' },
  { id: 'helper', name: '请一位烘焙帮手', description: '自动装炉，并在金黄时出炉；每日工资 ¥25。', price: 220, max: 1, icon: 'people' },
];
export const REGULARS = [
  { id: 'lin', name: '林奶奶', initial: '林', favorite: 'toast', tag: '总爱买一份牛奶吐司', color: '#d7b6a5', stories: ['“这香味，让我想起以前家门口的店。”', '“老伴说，明天还想吃你家的吐司。”', '“以后周末的早餐，就拜托你啦。”'] },
  { id: 'yu', name: '小雨', initial: '雨', favorite: 'roll', tag: '放学路过的学生', color: '#a7b7aa', stories: ['“放学后最期待的，就是这里的面包！”', '“我把这家店推荐给同学啦。”', '“等妈妈生日，我想来订一个蛋糕。”'] },
];

export const INGREDIENTS = [
  { id: 'flour', name: '面粉', unit: 2, bundle: 20, icon: 'wheat' },
  { id: 'butter', name: '黄油', unit: 4, bundle: 12, icon: 'gift' },
  { id: 'milk', name: '牛奶', unit: 2, bundle: 16, icon: 'leaf' },
];
export const NEEDS = { plain: '普通纸袋', slice: '吐司切片', warm: '要温热的', gift: '礼盒包装', decorate: '草莓装饰' };
export const VISITOR_STAGES = { arriving: '进店中', browsing: '挑选中', waiting: '待接单', ordering: '等候出餐', paying: '已交付', leaving: '离店中' };
export const DAY_SECONDS = 270;
export const getProduct = id => PRODUCTS.find(p => p.id === id);
export const capacity = s => 36 + s.upgrades.counter * 18;
export const occupied = s => Object.values(s.stock).reduce((a, b) => a + b, 0) + [...s.jobs, ...s.trays].reduce((a, j) => a + j.quantity, 0);
export const weatherFor = s => WEATHER[(s.day - 1) % WEATHER.length];
export const reputationLabel = s => s.reputation >= 70 ? '社区人气名店' : s.reputation >= 42 ? '街坊口碑小店' : s.reputation >= 28 ? '渐有名气' : '街角新店';
export const dailyTarget = s => Math.min(300, 140 + (s.day - 1) * 20);
export const upgradeCost = (s, u) => u.price * (s.upgrades[u.id] + 1);
export const sellingPrice = (s, id) => getProduct(id).price + [0, 1, 3][s.recipeLevels[id]];
export const bakeDuration = (s, id) => getProduct(id).time - s.recipeLevels[id] * 2;
export function dayEvent(s) {
  return s.day % 7 === 0 ? { title: '周末下午茶', description: '分享订单变多，普通客人会购买两份，并希望用礼盒包装。' } : s.day % 7 === 3 ? { title: '街坊早餐日', description: '熟客来得更多，非学生顾客会多带一份，提前准备日常面包。' } : s.day % 7 === 5 ? { title: '点心分享日', description: '普通客人想带两份点心送朋友，留意礼盒需求。' } : { title: '街角日常', description: weatherFor(s).label };
}
export const freshnessLimit = s => s.upgrades.warmer ? 120 : 60;
export const wages = s => 8 + s.upgrades.helper * 25 + s.upgrades.packer * 20 + s.upgrades.cashier * 20;
const counts = () => Object.fromEntries(PRODUCTS.map(p => [p.id, 0]));
const dailyStats = () => ({ revenue: 0, expense: 0, sold: 0, served: 0, missed: 0, waste: 0, bonus: 0, purchases: 0, materials: 0, packaging: 0, declined: 0, accepted: 0, qualityTotal: 0, ratedCount: 0, stockouts: 0, late: 0, unsold: 0, byProduct: counts() });
export function createGame(seed = Date.now() % 2147483647 || 7) {
  return {
    version: 2, day: 1, cash: 360, reputation: 20, phase: 'prep', minute: 540, elapsed: 0,
    stock: counts(), batches: [], jobs: [], trays: [], orders: [], visitors: [],
    mastery: counts(), recipeLevels: counts(), pantry: { flour: 24, butter: 18, milk: 18 }, menu: ['roll', 'toast', 'croissant'],
    unlocked: ['roll', 'toast', 'croissant'], upgrades: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),
    affection: { lin: 0, yu: 0 }, stats: dailyStats(), totalRevenue: 0, totalServed: 0,
    orderDone: false, reservationState: 'available', discount: false, paused: false, rng: seed, nextId: 1,
    events: [], history: [], reviews: [], theme: 'sage', lastSummary: null,
  };
}
function random(s) { s.rng = s.rng * 16807 % 2147483647; return s.rng / 2147483647; }
function event(s, text, type = 'note') { s.events.unshift({ id: s.nextId++, text, type, minute: s.minute, day: s.day }); s.events = s.events.slice(0, 30); }
function rep(s, n) { s.reputation = Math.max(0, Math.min(100, s.reputation + n)); }
function setStage(v, stage, duration) { Object.assign(v, { stage, remaining: duration, duration }); }
function visitor(s, id) { return s.visitors.find(v => v.id === Number(id)); }
function ticket(s, id) { return s.orders.find(o => o.id === Number(id)); }
function error(message) { return { error: message }; }
const ok = () => ({ ok: true });

export function hydrateGame(s) {
  if (s.version === 1) {
    s.version = 2;
    s.mastery = counts(); s.recipeLevels = counts(); s.pantry = { flour: 24, butter: 18, milk: 18 }; s.menu = s.unlocked.slice(0, 3);
    s.trays = []; s.orders = []; s.reviews = []; s.reservationState = s.orderDone ? 'done' : 'available';
    s.batches = PRODUCTS.filter(p => s.stock[p.id] > 0).map(p => ({ id: s.nextId++, product: p.id, quantity: s.stock[p.id], quality: 85, age: 0 }));
    s.jobs = s.jobs.map((j, slot) => ({ id: j.id, product: j.product, quantity: 6, duration: getProduct(j.product).time, elapsed: Math.max(0, getProduct(j.product).time - j.remaining), slot }));
    s.visitors = []; s.elapsed = Math.floor((s.minute - 540) / 2);
    s.stats = { ...dailyStats(), ...s.stats, byProduct: counts() };
    s.upgrades = { ...Object.fromEntries(UPGRADES.map(u => [u.id, 0])), ...s.upgrades };
    event(s, '营业台升级完成：原有零钱、配方、设备与关系均保留，开店原料已补齐。', 'upgrade');
  }
  return s;
}
export function toggleMenu(s, id) {
  if (s.phase !== 'prep') return error('菜单在开门前调整，营业中先照顾好已接的订单。');
  if (!s.unlocked.includes(id)) return error('先研发这份配方。');
  if (s.menu.includes(id)) {
    if (s.menu.length === 1) return error('至少保留一款面包。');
    if (s.stock[id] || [...s.jobs, ...s.trays].some(j => j.product === id) || s.orders.some(o => o.product === id)) return error('这款已有现货、在制批次或预订，今天先保留在菜单里。');
    s.menu = s.menu.filter(p => p !== id);
  } else { if (s.menu.length >= 3) return error('每天最多三款，先移除一款再加入新品。'); s.menu.push(id); }
  return ok();
}
export function buyIngredient(s, id) {
  const item = INGREDIENTS.find(i => i.id === id);
  if (!item || s.phase === 'closed') return error('明天再补充原料吧。');
  const cost = item.unit * item.bundle;
  if (s.cash < cost) return error(`采购还差 ¥${cost - s.cash}。`);
  if (s.pantry[id] + item.bundle > 200) return error('这项原料已经够用了，先消耗一些。');
  s.cash -= cost; s.pantry[id] += item.bundle; s.stats.purchases += cost;
  event(s, `采购 ${item.name} ${item.bundle} 份，支付 ¥${cost}，原料可留到明天。`, 'note'); return ok();
}
export function prepareBatch(s, id) {
  const p = getProduct(id);
  if (!p || !s.menu.includes(id)) return error('先在开门前将这款加入今日菜单。');
  if (s.phase === 'closed') return error('已经打烊，明天再备料吧。');
  if (s.trays.length >= 1 + s.upgrades.prep) return error('备料台已满，把准备好的烤盘装炉后再继续。');
  if (occupied(s) + 6 > capacity(s)) return error('陈列位不足，先出餐或升级展示柜。');
  const missing = INGREDIENTS.filter(i => s.pantry[i.id] < p.ingredients[i.id]);
  if (missing.length) return error(`缺少${missing.map(i => i.name).join('、')}，在原料柜补货吧。`);
  INGREDIENTS.forEach(i => s.pantry[i.id] -= p.ingredients[i.id]);
  s.stats.materials += p.cost; s.stats.expense += p.cost;
  s.trays.push({ id: s.nextId++, product: id, quantity: 6, remaining: 4, duration: 4 });
  event(s, `正在揉制一盘${p.name}，消耗原料成本 ¥${p.cost}。`, 'bake'); return ok();
}
export const bake = prepareBatch;
export function loadOven(s, id) {
  const tray = s.trays.find(t => t.id === Number(id));
  if (s.phase === 'closed' || !tray || tray.remaining > 0) return error('等面团备好，再装入烤箱。');
  const slot = Array.from({ length: 1 + s.upgrades.oven }, (_, i) => i).find(i => !s.jobs.some(j => j.slot === i));
  if (slot === undefined) return error('所有炉位都在使用中，先出炉或添置烤箱。');
  s.trays = s.trays.filter(t => t !== tray);
  s.jobs.push({ id: tray.id, product: tray.product, quantity: 6, slot, elapsed: 0, duration: bakeDuration(s, tray.product) });
  event(s, `${getProduct(tray.product).name}已装入 ${slot + 1} 号烤箱，留意金黄出炉区间。`, 'bake'); return ok();
}
export function ovenStatus(job) {
  const r = job.elapsed / job.duration;
  return r < .65 ? { label: '还没烤熟', quality: 35, tone: 'raw' } : r < 1 ? { label: '还差一点', quality: 65, tone: 'warming' } : r <= 1.4 ? { label: '金黄出炉！', quality: 100, tone: 'golden' } : r <= 1.8 ? { label: '有些偏焦', quality: 65, tone: 'over' } : { label: '烤焦了', quality: 30, tone: 'burnt' };
}
function addBatch(s, product, quantity, quality, age = 0) {
  if (quantity <= 0) return;
  s.stock[product] += quantity;
  s.batches.push({ id: s.nextId++, product, quantity, quality, age });
}
export function removeBatch(s, id) {
  const job = s.jobs.find(j => j.id === Number(id));
  if (!job || s.phase === 'closed') return error('这炉已经收好啦。');
  const status = ovenStatus(job);
  s.jobs = s.jobs.filter(j => j !== job); addBatch(s, job.product, 6, status.quality);
  event(s, `${getProduct(job.product).name}出炉 6 份：${status.label}，烘焙品质 ${status.quality}。`, 'ready'); return ok();
}
export function stockInfo(s, id) {
  const batches = s.batches.filter(b => b.product === id && b.quantity > 0);
  const qty = batches.reduce((a, b) => a + b.quantity, 0);
  const quality = qty ? Math.round(batches.reduce((a, b) => a + b.quality * b.quantity, 0) / qty) : 0;
  const age = qty ? Math.max(...batches.map(b => b.age)) : 0;
  return { quantity: qty, quality, age, fresh: age <= freshnessLimit(s) };
}
function takeStock(s, id, quantity) {
  if (s.stock[id] < quantity) return null;
  let remaining = quantity, quality = 0, age = 0;
  // Oldest stock first: production planning and the warming cabinet matter.
  for (const b of s.batches.filter(b => b.product === id).sort((a, b) => b.age - a.age)) {
    const n = Math.min(b.quantity, remaining); b.quantity -= n; remaining -= n;
    quality += b.quality * n; age += b.age * n; if (!remaining) break;
  }
  s.batches = s.batches.filter(b => b.quantity > 0); s.stock[id] -= quantity;
  return { quality: quality / quantity, age: age / quantity, at: s.elapsed };
}

const AUDIENCES = [
  { name: '学生小可', look: 0, favorite: 'roll', need: 'plain', patience: 80, budget: 12 },
  { name: '上班族阿晨', look: 1, favorite: 'croissant', need: 'warm', patience: 50, budget: 30 },
  { name: '甜点客阿梨', look: 2, favorite: 'croissant', need: 'gift', patience: 95, budget: 38 },
];
function spawnVisitor(s) {
  if (s.visitors.length >= 6) return;
  const first = s.day === 1 && s.elapsed === 0;
  const r = first ? REGULARS[1] : random(s) < (s.day % 7 === 3 ? .65 : .4) ? REGULARS[Math.floor(random(s) * 2)] : null;
  const a = AUDIENCES[Math.floor(random(s) * AUDIENCES.length)];
  let product = r?.favorite || (s.menu.includes(a.favorite) ? a.favorite : s.menu[Math.floor(random(s) * s.menu.length)]);
  const sweet = !r && a.look === 2;
  if (sweet && s.menu.includes('cake')) product = 'cake';
  let need = r?.id === 'lin' ? 'slice' : r?.id === 'yu' ? 'plain' : product === 'cake' ? 'decorate' : a.need;
  const patience = r?.id === 'lin' ? 110 : r?.id === 'yu' ? 85 : a.patience;
  let budget = r?.id === 'yu' ? 12 : r?.id === 'lin' ? 24 : Math.max(a.budget, getProduct(product).price + (need === 'gift' ? 4 : 0));
  const sharing = !r && [0, 5].includes(s.day % 7);
  const quantity = sharing || (s.day % 7 === 3 && (r ? r.id === 'lin' : a.look !== 0)) ? 2 : 1;
  if (sharing) need = 'gift';
  if (quantity === 2) budget = Math.max(budget, sellingPrice(s, product) * 2 + (need === 'gift' ? 4 : 0) + 4);
  s.visitors.push({ id: s.nextId++, name: r?.name || a.name, regular: r?.id || null, look: r ? r.id === 'lin' ? 3 : 4 : a.look,
    requested: product, selected: null, quantity, stage: 'arriving', remaining: 3, duration: 3, patience,
    need, budget, known: false, waitUsed: false, recommended: false, outcome: 'pending', paidAmount: 0, tip: 0,
    line: r?.id === 'lin' ? '早呀，想带一份吐司回家，像往常一样。' : r?.id === 'yu' ? '老板好，今天想买一只餐包！' : a.look === 1 ? '马上要上班，想带份早餐。' : sweet ? '想买份好看的点心送朋友。' : '刚下课，想买一份面包。' });
}
export function openShop(s) {
  if (s.phase !== 'prep') return error('现在不能开门。');
  if (!occupied(s) && !s.orders.some(o => o.items)) return error('先准备一盘面团，再开门迎客吧。');
  s.phase = 'open'; s.elapsed = 0; s.minute = 540; spawnVisitor(s);
  event(s, '开门营业！确认需求、接单出餐，今天也请多关照。', 'open'); return ok();
}
export function askVisitor(s, id) {
  const v = visitor(s, id);
  if (!v || !['waiting', 'ordering'].includes(v.stage)) return error('客人到柜台后，就能询问需求。');
  if (v.known) return error('需求已经记在订单上啦。');
  v.known = true;
  const texts = { plain: `预算 ¥${v.budget}，一份${getProduct(v.selected || v.requested).name}，普通纸袋就好。`, slice: '请帮我把吐司切成六片，家里两个人慢慢吃。', warm: '我只有一点时间，想要温热的，凉了就不太喜欢了。', gift: '这是送朋友的，请装礼盒，包装费也可以。', decorate: '给朋友一个小惊喜，能加草莓装饰吗？' };
  v.line = texts[v.need]; const o = s.orders.find(o => o.visitorId === v.id); if (o) o.known = true; return ok();
}
export const greetVisitor = askVisitor;
export function waitVisitor(s, id) {
  const v = visitor(s, id);
  if (!v || !['waiting', 'ordering'].includes(v.stage)) return error('先等客人到柜台。');
  if (v.waitUsed) return error('已经说明过等候，请尽快兑现承诺。');
  v.waitUsed = true;
  const o = s.orders.find(o => o.visitorId === v.id);
  const extension = Math.max(0, Math.min(v.look === 1 ? 5 : 15, o ? DAY_SECONDS - o.deadline : 15));
  v.remaining += extension; v.duration += extension;
  if (o) o.deadline += extension;
  v.line = extension === 0 ? '快打烊啦，能不能优先做好我的这一份？' : `好呀，我再多等 ${extension} 秒，记得把热乎的留给我。`; return ok();
}
export function recommendVisitor(s, id, product) {
  const v = visitor(s, id), p = getProduct(product);
  if (!v || v.stage !== 'waiting' || !p || !s.menu.includes(product)) return error('接单前，可以推荐今日菜单中的另一款。');
  if (v.recommended) return error('推荐已经确认，可以接单了。');
  if (Math.round(sellingPrice(s, product) * (s.discount ? .8 : 1)) * v.quantity + (v.need === 'gift' ? 4 : 0) > v.budget) return error(`超出客人 ¥${v.budget} 的预算，换一款吧。`);
  v.selected = product; v.recommended = true;
  if (v.need === 'slice' && product !== 'toast') v.need = 'plain';
  if (v.need === 'decorate' && !['cake', 'tart'].includes(product)) v.need = 'gift';
  v.line = `那就换成${p.name}吧，听老板的推荐。`; return ok();
}
export function acceptOrder(s, id) {
  const v = visitor(s, id);
  if (!v || v.stage !== 'waiting' || s.phase !== 'open') return error('客人到柜台后可以接单。');
  if (s.orders.length >= 3) return error('三张订单已经排满，先交付一张再接。');
  const product = v.selected || v.requested;
  if (!s.menu.includes(product)) return error('这款不在今日菜单，先推荐另一款吧。');
  const quote = Math.round(sellingPrice(s, product) * (s.discount ? .8 : 1)) * v.quantity + (v.need === 'gift' ? 4 : 0);
  if (quote > v.budget) return error('订单超出预算，先推荐合适的替代品。');
  const o = { id: s.nextId++, visitorId: v.id, name: v.name, product, quantity: v.quantity, need: v.need, known: v.known,
    stage: 'accepted', sliced: false, decoration: null, packaging: null, task: null, taskRemaining: 0, items: null,
    createdAt: s.elapsed, deadline: Math.min(DAY_SECONDS, s.elapsed + v.remaining), quote, reservation: false };
  s.orders.push(o); s.stats.accepted++; setStage(v, 'ordering', o.deadline - s.elapsed);
  v.line = '好，那就拜托你啦，我在柜台等。'; event(s, `接单 #${o.id}：${v.name}的${getProduct(product).name} × ${v.quantity}。`, 'note'); return ok();
}
export function declineVisitor(s, id) {
  const v = visitor(s, id);
  if (!v || v.stage !== 'waiting') return error('已接的订单请尽力完成。');
  v.outcome = 'miss'; v.line = '没关系，下次有空再来。'; setStage(v, 'leaving', 4); s.stats.declined++; return ok();
}
export function startAssembly(s, id) {
  const o = ticket(s, id);
  if (!o || o.stage !== 'accepted' || s.phase === 'closed') return error('这张订单已经在处理中。');
  if (s.orders.some(t => t.stage === 'assembling')) return error('出餐台正在处理另一单，先包装收好。');
  if (s.stock[o.product] < o.quantity) { s.stats.stockouts++; return error(`还差 ${o.quantity - s.stock[o.product]} 份${getProduct(o.product).name}，先排一炉吧。`); }
  o.items = takeStock(s, o.product, o.quantity); o.stage = 'assembling';
  if (o.product === 'toast' && s.upgrades.slicer && o.known && o.need === 'slice') { o.task = 'slicing'; o.taskRemaining = 1; }
  return ok();
}
export function sliceOrder(s, id) {
  const o = ticket(s, id);
  if (!o || o.stage !== 'assembling' || o.product !== 'toast' || o.sliced || o.task) return error('取出吐司后，可以在出餐台切片。');
  o.task = 'slicing'; o.taskRemaining = s.upgrades.slicer ? 1 : 3; return ok();
}
export function decorateOrder(s, id, topping) {
  const o = ticket(s, id);
  if (!o || o.stage !== 'assembling' || !['cake', 'tart'].includes(o.product) || o.decoration || o.task || !['berry', 'cream', 'lemon'].includes(topping)) return error('先把甜点取到出餐台，再选择装饰。');
  if (s.cash < 1) return error('装饰材料需要 ¥1。');
  o.decoration = topping; o.task = 'decorating'; o.taskRemaining = 3; s.cash--; s.stats.expense++; s.stats.packaging++; return ok();
}
export function packOrder(s, id, packaging) {
  const o = ticket(s, id);
  if (!o || o.stage !== 'assembling' || o.task || !['paper', 'gift'].includes(packaging)) return error('等切片或装饰完成，再选择包装。');
  const cost = packaging === 'gift' ? 3 : 1;
  if (s.cash < cost) return error(`包装需要 ¥${cost}，先交付现有订单。`);
  s.cash -= cost; s.stats.expense += cost; s.stats.packaging += cost;
  o.packaging = packaging; o.stage = 'packed'; return ok();
}
function returnItems(s, o) {
  if (!o.items) return;
  const room = Math.max(0, capacity(s) - occupied(s)), returned = Math.min(o.quantity, room);
  addBatch(s, o.product, returned, o.items.quality, o.items.age + Math.max(0, s.elapsed - o.items.at));
  s.stats.waste += o.quantity - returned;
}
function failOrder(s, o, reason) {
  returnItems(s, o); s.orders = s.orders.filter(t => t !== o); s.stats.missed++; s.stats.late++;
  rep(s, -1); if (o.reservation) s.reservationState = 'failed';
  const v = visitor(s, o.visitorId); if (v) { v.outcome = 'miss'; v.line = reason; setStage(v, 'leaving', 4); }
  event(s, `${o.name}的订单未交付：${reason}。已取出的面包尽量回架，包装费不返还。`, 'miss');
}
export function cancelOrder(s, id) {
  const o = ticket(s, id); if (!o) return error('订单已经结束。'); failOrder(s, o, '这次没能按约完成，下次再来'); return ok();
}
export function deliverOrder(s, id, recipient = null) {
  const o = ticket(s, id);
  if (!o || o.stage !== 'packed' || s.phase === 'closed') return error('先完成包装，再交付给对应顾客。');
  if (o.reservation && (s.phase !== 'open' || s.elapsed < 150)) return error('预订在 14:00 后取货，先放在出餐台等候。');
  if (recipient !== null && Number(recipient) !== o.visitorId) return error('这份不是这位客人的订单，请对照姓名交付。');
  const v = visitor(s, o.visitorId);
  if (!v || !['ordering', 'waiting'].includes(v.stage)) return error('客人已经离开了。');
  const age = o.items.age + Math.max(0, s.elapsed - o.items.at);
  const freshScore = age <= freshnessLimit(s) ? 100 : Math.max(25, 100 - (age - freshnessLimit(s)) * .8);
  const exact = (o.need !== 'slice' || o.sliced) && (o.need !== 'gift' || o.packaging === 'gift') && (o.need !== 'warm' || age <= freshnessLimit(s)) && (o.need !== 'decorate' || o.decoration === 'berry');
  const service = o.deadline - s.elapsed > 15 ? 100 : o.deadline - s.elapsed > 5 ? 70 : 45;
  const score = Math.max(10, Math.min(100, Math.round(o.items.quality * .45 + freshScore * .25 + service * .3 - (exact ? 0 : 40))));
  const tip = !o.reservation && v.budget > o.quote && score >= 85 ? Math.min(v.budget - o.quote, Math.round(o.quote * (score >= 95 ? .12 : .05))) : 0;
  const paid = Math.round(o.quote * (score < 60 || o.items.quality < 50 ? .6 : 1)) + tip;
  s.cash += paid; s.stats.revenue += paid; s.totalRevenue += paid; s.stats.sold += o.quantity; s.stats.served++; s.totalServed++;
  s.stats.qualityTotal += score; s.stats.ratedCount++; s.stats.byProduct[o.product] += o.quantity;
  if (score >= 70) s.mastery[o.product] += o.quantity;
  rep(s, score >= 85 ? 2 : score >= 65 ? 1 : -2);
  if (v.regular && score >= 70) s.affection[v.regular] += score >= 95 ? 2 : 1;
  const comment = !exact ? o.need === 'slice' ? '吐司没切片，下次记得帮我切好呀。' : o.need === 'gift' ? '说好是送人的礼盒，下次别忘了。' : o.need === 'warm' ? '面包已经凉了，下次希望能吃到热的。' : '装饰和说好的不一样，下次再用心一点。' : o.items.quality < 70 ? '烘焙程度还差一点，再多练一炉吧。' : freshScore < 80 ? '放得有些久了，刚出炉时应该更好吃。' : service < 80 ? '好吃是好吃，就是等得有点久。' : v.regular === 'lin' ? '切得整整齐齐，这份日常让人安心。' : '又新鲜又合心意，下次还来！';
  Object.assign(v, { outcome: 'sale', selected: o.product, quantity: o.quantity, paidAmount: paid, tip, line: comment, package: o.packaging }); setStage(v, 'paying', 3);
  s.reviews.unshift({ id: s.nextId++, day: s.day, name: v.name, product: o.product, score, comment }); s.reviews = s.reviews.slice(0, 20);
  s.orders = s.orders.filter(t => t !== o);
  if (o.reservation) { s.orderDone = true; s.reservationState = 'done'; rep(s, 3); }
  event(s, `${v.name}收到${getProduct(o.product).name} × ${o.quantity}，实收 ¥${paid}，评价 ${score} 分。${comment}`, v.regular ? 'regular' : 'sale'); return ok();
}
export function orderFor(s) {
  const product = ['roll', 'toast', 'croissant'][(s.day - 1) % 3];
  const existing = s.orders.find(o => o.reservation);
  return { product, quantity: 6, reward: existing?.quote ?? sellingPrice(s, product) * 6 + 28, name: ['小雨的课间分享', '林奶奶的早餐篮', '办公室下午茶'][(s.day - 1) % 3] };
}
export function acceptReservation(s) {
  if (s.reservationState !== 'available' || s.phase === 'closed' || s.elapsed >= 180) return error('今天的预订已结束或已经接下。');
  if (s.orders.length >= 3) return error('订单栏已满，先完成一张。');
  const r = orderFor(s); if (!s.menu.includes(r.product)) return error('预订商品不在今日菜单，需要开门前调整菜单。');
  s.orders.push({ id: s.nextId++, visitorId: null, name: r.name, product: r.product, quantity: 6, need: 'gift', known: true, stage: 'accepted', sliced: false, decoration: null, packaging: null, task: null, taskRemaining: 0, items: null, createdAt: s.elapsed, deadline: 210, quote: r.reward, reservation: true });
  s.reservationState = 'accepted'; s.stats.accepted++; ensureCourier(s); return ok();
}
export const fulfillOrder = acceptReservation;
function ensureCourier(s) {
  const o = s.orders.find(o => o.reservation && o.visitorId === null);
  if (!o || s.phase !== 'open' || s.elapsed < 150) return;
  const id = s.nextId++;
  s.visitors.push({ id, name: '预订取货员', regular: null, look: 1, requested: o.product, selected: o.product, quantity: 6, stage: 'ordering', remaining: 210 - s.elapsed, duration: 210 - s.elapsed, patience: 60, need: 'gift', budget: o.quote, known: true, waitUsed: true, recommended: false, outcome: 'pending', paidAmount: 0, tip: 0, line: '下午茶订好的六份点心，礼盒准备好了吗？' });
  o.visitorId = id;
}
export function improveRecipe(s, id) {
  const p = getProduct(id), level = s.recipeLevels[id];
  if (!p || !s.unlocked.includes(id) || level >= 2) return error('这份配方已经成为招牌，或尚未研发。');
  const required = level === 0 ? 6 : 18, cost = level === 0 ? 80 : 160;
  if (s.mastery[id] < required) return error(`需要累计 ${required} 份获得好评的出餐，当前 ${s.mastery[id]} 份。`);
  if (s.cash < cost) return error(`改良还需要 ¥${cost - s.cash}。`);
  s.cash -= cost; s.recipeLevels[id]++;
  event(s, `${p.name}${level === 0 ? '改良完成' : '成为招牌'}，每炉缩短 2 秒，新的接单价格提高。`, 'upgrade'); return ok();
}
export function buyUpgrade(s, id) {
  const u = UPGRADES.find(u => u.id === id);
  if (!u || s.upgrades[id] >= u.max) return error('这项升级已经完成。');
  const cost = upgradeCost(s, u); if (s.cash < cost) return error(`还差 ¥${cost - s.cash}，先完成几份订单吧。`);
  s.cash -= cost; s.upgrades[id]++; event(s, `${u.name}升级完成，新的操作能力已生效。`, 'upgrade'); return ok();
}
export function research(s, id) {
  const p = getProduct(id);
  if (!p || s.unlocked.includes(id)) return error('已经掌握这份配方。');
  if (s.reputation < p.unlock) return error(`口碑达到 ${p.unlock} 后可以研发。`);
  if (s.cash < p.research) return error(`研发还差 ¥${p.research - s.cash}。`);
  s.cash -= p.research; s.unlocked.push(id); event(s, `${p.name}研发成功，下一次开门前可以加入菜单。`, 'upgrade'); return ok();
}
function advanceVisitors(s) {
  for (const v of [...s.visitors]) {
    v.remaining--;
    if (v.remaining > 0) continue;
    if (v.stage === 'arriving') setStage(v, 'browsing', 3);
    else if (v.stage === 'browsing') setStage(v, 'waiting', v.patience);
    else if (v.stage === 'waiting') { v.outcome = 'miss'; v.line = '等了好一会儿都没接单，下次再来吧。'; setStage(v, 'leaving', 4); s.stats.missed++; rep(s, -1); event(s, `${v.name}没有被接待，遗憾地离开。`, 'miss'); }
    else if (v.stage === 'ordering') { const o = s.orders.find(o => o.visitorId === v.id); if (o) failOrder(s, o, '等太久啦，我得先走了'); else { v.outcome = 'miss'; setStage(v, 'leaving', 4); } }
    else if (v.stage === 'paying') setStage(v, 'leaving', 4);
  }
  s.visitors = s.visitors.filter(v => v.remaining > 0);
}
function staffWork(s) {
  if (s.upgrades.helper) {
    for (const j of [...s.jobs]) if (j.elapsed >= j.duration) removeBatch(s, j.id);
    for (const t of [...s.trays]) if (t.remaining <= 0) loadOven(s, t.id);
  }
  if (s.upgrades.packer) for (const o of s.orders) if (o.stage === 'assembling' && !o.task && o.need === 'plain') packOrder(s, o.id, 'paper');
  if (s.upgrades.cashier && s.phase === 'open') {
    for (const v of s.visitors) if (v.stage === 'waiting' && v.need === 'plain' && s.menu.includes(v.selected || v.requested)) { v.known = true; acceptOrder(s, v.id); }
    for (const o of [...s.orders]) if (o.stage === 'packed') deliverOrder(s, o.id);
  }
}
export function advance(s, seconds = 1) {
  if (s.paused || s.phase === 'closed') return;
  for (let n = 0; n < seconds; n++) {
    for (const t of s.trays) t.remaining = Math.max(0, t.remaining - 1);
    for (const j of s.jobs) j.elapsed++;
    for (const o of s.orders) if (o.task) { o.taskRemaining--; if (o.taskRemaining <= 0) { if (o.task === 'slicing') o.sliced = true; o.task = null; o.taskRemaining = 0; } }
    if (s.phase === 'open') {
      s.elapsed++; s.minute = Math.min(1080, 540 + s.elapsed * 2);
      for (const b of s.batches) b.age++;
      advanceVisitors(s); ensureCourier(s);
      for (const o of [...s.orders]) if (o.reservation && s.elapsed >= o.deadline) failOrder(s, o, '超过约定取货时间');
      const interval = Math.max(12, weatherFor(s).interval - s.upgrades.sign * 3 - (s.day % 7 === 0 ? 3 : 0));
      if (s.elapsed % interval === 0 && s.elapsed < 240) spawnVisitor(s);
    }
    staffWork(s);
    if (s.phase === 'open' && s.elapsed >= DAY_SECONDS) { closeShop(s); break; }
  }
}
export function closeShop(s) {
  if (s.phase !== 'open') return error('还没有开始营业。');
  for (const o of [...s.orders]) failOrder(s, o, '打烊前没有完成交付');
  const unsold = Object.values(s.stock).reduce((a, b) => a + b, 0);
  const clearance = s.batches.reduce((a, b) => a + b.quantity * Math.floor(getProduct(b.product).price * .25 * b.quality / 100), 0);
  s.stats.waste += [...s.jobs, ...s.trays].reduce((a, j) => a + j.quantity, 0);
  s.stats.unsold = unsold; const fee = wages(s); const goalMet = s.stats.revenue >= dailyTarget(s);
  s.stats.bonus = goalMet ? 40 : 0; s.cash += clearance + s.stats.bonus - fee; s.stats.expense += fee;
  s.stock = counts(); s.batches = []; s.jobs = []; s.trays = []; s.visitors = []; s.orders = [];
  s.phase = 'closed'; s.paused = false;
  if (s.reservationState === 'available') s.reservationState = 'expired';
  const average = s.stats.ratedCount ? Math.round(s.stats.qualityTotal / s.stats.ratedCount) : 0;
  s.lastSummary = { ...s.stats, byProduct: { ...s.stats.byProduct }, day: s.day, clearance, average, profit: s.stats.revenue + clearance + s.stats.bonus - s.stats.expense, goalMet, early: s.minute < 1080 };
  s.history.unshift(s.lastSummary); s.history = s.history.slice(0, 30);
  event(s, `今天完成 ${s.stats.served} 单，平均评价 ${average} 分；原料会留到明天，明天也继续加油。`, 'close'); return ok();
}
export function nextDay(s) {
  if (s.phase !== 'closed') return error('先完成今天的营业。');
  s.day++; s.phase = 'prep'; s.minute = 540; s.elapsed = 0; s.stats = dailyStats(); s.orderDone = false; s.reservationState = 'available'; s.discount = false; s.lastSummary = null;
  const canProduce = s.menu.some(id => INGREDIENTS.every(i => s.pantry[i.id] >= getProduct(id).ingredients[i.id]));
  if (s.cash < 120 && !canProduce) {
    const aid = Math.max(0, 80 - s.cash); s.cash += aid;
    const starter = getProduct(s.menu[0]); INGREDIENTS.forEach(i => s.pantry[i.id] = Math.max(s.pantry[i.id], starter.ingredients[i.id] * 2));
    event(s, `街坊互助送来 ¥${aid} 和两盘开店原料，再开一炉重新出发吧。`, 'regular');
  } else if (s.cash < 4) { const aid = 20 - s.cash; s.cash = 20; event(s, `街坊送来 ¥${aid} 周转包装零钱，明天慢慢来。`, 'regular'); }
  event(s, `第 ${s.day} 天，${weatherFor(s).name}。开门前可调整三款菜单。`, 'note'); return ok();
}

function validateLegacySave(raw) {
  if (!raw || raw.version !== 1) return false;
  const numeric = ['day', 'cash', 'reputation', 'minute', 'rng', 'elapsed', 'nextId', 'totalRevenue', 'totalServed'];
  if (!numeric.every(k => Number.isFinite(raw[k]))) return false;
  if (!Number.isInteger(raw.day) || raw.day < 1 || raw.reputation < 0 || raw.reputation > 100 || !Number.isInteger(raw.rng) || raw.rng <= 0 || raw.rng >= 2147483647 || raw.minute < 540 || raw.minute > 1080) return false;
  if (!['prep', 'open', 'closed'].includes(raw.phase) || !['sage', 'rose', 'sand'].includes(raw.theme)) return false;
  if (!Array.isArray(raw.unlocked) || !['roll', 'toast', 'croissant'].every(id => raw.unlocked.includes(id)) || raw.unlocked.some(id => !getProduct(id))) return false;
  if (!raw.stock || !PRODUCTS.every(p => Number.isInteger(raw.stock[p.id]) && raw.stock[p.id] >= 0)) return false;
  if (!raw.upgrades || ![{id:'oven',max:2},{id:'counter',max:3},{id:'sign',max:2},{id:'helper',max:1}].every(u => Number.isInteger(raw.upgrades[u.id]) && raw.upgrades[u.id] >= 0 && raw.upgrades[u.id] <= u.max)) return false;
  if (!raw.affection || !REGULARS.every(r => Number.isInteger(raw.affection[r.id]) && raw.affection[r.id] >= 0)) return false;
  if (!raw.stats || !['revenue','expense','sold','served','missed','waste','bonus'].every(k => Number.isFinite(raw.stats[k]) && raw.stats[k] >= 0)) return false;
  if (!Array.isArray(raw.jobs) || raw.jobs.length > 3 || raw.jobs.some(j => !getProduct(j.product) || !raw.unlocked.includes(j.product) || j.quantity !== 6 || !Number.isFinite(j.duration) || j.duration <= 0 || !Number.isFinite(j.remaining) || j.remaining <= 0 || j.remaining > j.duration)) return false;
  if (!Array.isArray(raw.events) || raw.events.length > 30 || raw.events.some(e => typeof e.text !== 'string' || typeof e.type !== 'string' || !Number.isFinite(e.minute) || !Number.isFinite(e.day))) return false;
  if (!Array.isArray(raw.history) || raw.history.length > 30 || raw.history.some(h => !['day', 'revenue', 'expense', 'clearance', 'bonus', 'profit', 'served', 'missed', 'sold', 'waste'].every(k => Number.isFinite(h[k])))) return false;
  if (raw.phase === 'closed' && (!raw.lastSummary || !['day', 'revenue', 'expense', 'clearance', 'bonus', 'profit', 'served', 'missed', 'sold', 'waste'].every(k => Number.isFinite(raw.lastSummary[k])))) return false;
  if (raw.visitors !== undefined) {
    if (!Array.isArray(raw.visitors) || raw.visitors.length > 6 || new Set(raw.visitors.map(v => v?.id)).size !== raw.visitors.length) return false;
    for (const v of raw.visitors) {
      if (!v || !Number.isInteger(v.id) || v.id < 1 || typeof v.name !== 'string' || v.name.length > 30 || typeof v.line !== 'string' || v.line.length > 300) return false;
      if (!Object.hasOwn(VISITOR_STAGES, v.stage) || !Number.isFinite(v.duration) || !Number.isFinite(v.remaining) || v.remaining <= 0 || v.remaining > v.duration || v.duration > 30) return false;
      if (!Number.isInteger(v.look) || v.look < 0 || v.look > 4 || ![null, 'lin', 'yu'].includes(v.regular)) return false;
      if (!Array.isArray(v.favorites) || !v.favorites.length || v.favorites.length > 5 || v.favorites.some(id => !getProduct(id)) || !getProduct(v.requested) || (v.selected !== null && !getProduct(v.selected))) return false;
      if (![1, 2].includes(v.quantity) || !['pending', 'sale', 'miss'].includes(v.outcome) || !Number.isFinite(v.paidAmount) || v.paidAmount < 0 || ![0, 2].includes(v.tip)) return false;
      if (![v.greeted, v.waitUsed, v.recommended].every(flag => typeof flag === 'boolean')) return false;
      if ((['arriving', 'browsing', 'waiting'].includes(v.stage) && v.outcome !== 'pending') || (v.stage === 'paying' && v.outcome !== 'sale') || (v.stage === 'leaving' && v.outcome === 'pending')) return false;
    }
    if (raw.phase !== 'open' && raw.visitors.length) return false;
  }
  return typeof raw.paused === 'boolean' && typeof raw.discount === 'boolean' && typeof raw.orderDone === 'boolean';
}

export function validateSave(raw) {
  if (raw?.version === 1) {
    if (!validateLegacySave(raw)) return false;
    try { return validateSave(hydrateGame(structuredClone(raw))); } catch { return false; }
  }
  if (!raw || raw.version !== 2) return false;
  const finite = (n, min = -Infinity, max = Infinity) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
  const integer = (n, min = 0, max = 1000000000) => Number.isInteger(n) && n >= min && n <= max;
  const text = (v, max = 300) => typeof v === 'string' && v.length <= max;
  const item = id => typeof id === 'string' && PRODUCTS.some(p => p.id === id);
  const statsValid = st => st && Object.keys(dailyStats()).filter(k => k !== 'byProduct').every(k => finite(st[k], 0)) && st.byProduct && PRODUCTS.every(p => integer(st.byProduct[p.id]));
  const summaryValid = h => h && ['day', 'revenue', 'expense', 'clearance', 'bonus', 'profit', 'served', 'missed', 'sold', 'waste'].every(k => finite(h[k]));
  if (!integer(raw.day, 1) || !finite(raw.cash) || !finite(raw.reputation, 0, 100) || !integer(raw.rng, 1, 2147483646) || !integer(raw.nextId, 1) || !integer(raw.elapsed, 0, DAY_SECONDS) || !finite(raw.minute, 540, 1080) || !finite(raw.totalRevenue, 0) || !integer(raw.totalServed)) return false;
  if (!['prep', 'open', 'closed'].includes(raw.phase) || !['sage', 'rose', 'sand'].includes(raw.theme) || !['available', 'accepted', 'done', 'failed', 'expired'].includes(raw.reservationState)) return false;
  if (![raw.paused, raw.discount, raw.orderDone].every(f => typeof f === 'boolean')) return false;
  if (!Array.isArray(raw.unlocked) || raw.unlocked.length > 6 || !['roll', 'toast', 'croissant'].every(id => raw.unlocked.includes(id)) || !raw.unlocked.every(item)) return false;
  if (!Array.isArray(raw.menu) || raw.menu.length < 1 || raw.menu.length > 3 || new Set(raw.menu).size !== raw.menu.length || raw.menu.some(id => !raw.unlocked.includes(id))) return false;
  if (!raw.mastery || !raw.recipeLevels || !PRODUCTS.every(p => integer(raw.mastery[p.id]) && integer(raw.recipeLevels[p.id], 0, 2))) return false;
  if (!raw.pantry || !INGREDIENTS.every(i => integer(raw.pantry[i.id], 0, 10000)) || !raw.stock || !PRODUCTS.every(p => integer(raw.stock[p.id], 0, 1000))) return false;
  if (!raw.upgrades || !UPGRADES.every(u => integer(raw.upgrades[u.id], 0, u.max)) || !raw.affection || !REGULARS.every(r => integer(raw.affection[r.id]))) return false;
  if (!statsValid(raw.stats)) return false;
  if (!Array.isArray(raw.batches) || raw.batches.length > 100 || raw.batches.some(b => !b || !integer(b.id, 1) || !item(b.product) || !integer(b.quantity, 1, 1000) || !finite(b.quality, 0, 100) || !finite(b.age, 0))) return false;
  if (PRODUCTS.some(p => raw.stock[p.id] !== raw.batches.filter(b => b.product === p.id).reduce((sum, b) => sum + b.quantity, 0))) return false;
  if (!Array.isArray(raw.trays) || raw.trays.length > 1 + raw.upgrades.prep || raw.trays.some(t => !t || !integer(t.id, 1) || !item(t.product) || t.quantity !== 6 || t.duration !== 4 || !integer(t.remaining, 0, 4))) return false;
  if (!Array.isArray(raw.jobs) || raw.jobs.length > 1 + raw.upgrades.oven || new Set(raw.jobs.map(j => j?.slot)).size !== raw.jobs.length || raw.jobs.some(j => !j || !integer(j.id, 1) || !item(j.product) || j.quantity !== 6 || !integer(j.slot, 0, raw.upgrades.oven) || !integer(j.elapsed) || ![getProduct(j.product).time, getProduct(j.product).time - 2, getProduct(j.product).time - 4].includes(j.duration))) return false;
  if (occupied(raw) > capacity(raw)) return false;
  if (!Array.isArray(raw.visitors) || raw.visitors.length > 7 || new Set(raw.visitors.map(v => v?.id)).size !== raw.visitors.length) return false;
  for (const v of raw.visitors) {
    if (!v || !integer(v.id, 1) || !text(v.name, 30) || !text(v.line) || ![null, 'lin', 'yu'].includes(v.regular) || !integer(v.look, 0, 4) || !item(v.requested) || (v.selected !== null && !item(v.selected)) || !integer(v.quantity, 1, 6)) return false;
    if (!Object.hasOwn(VISITOR_STAGES, v.stage) || !finite(v.remaining, 1, 1000) || !finite(v.duration, v.remaining, 1000) || !finite(v.patience, 1, 1000) || !Object.hasOwn(NEEDS, v.need) || !finite(v.budget, 0) || !finite(v.paidAmount, 0) || !finite(v.tip, 0)) return false;
    if (![v.known, v.waitUsed, v.recommended].every(f => typeof f === 'boolean') || !['pending', 'sale', 'miss'].includes(v.outcome)) return false;
    if ((['arriving', 'browsing', 'waiting', 'ordering'].includes(v.stage) && v.outcome !== 'pending') || (v.stage === 'paying' && v.outcome !== 'sale') || (v.stage === 'leaving' && v.outcome === 'pending')) return false;
  }
  if (!Array.isArray(raw.orders) || raw.orders.length > 3 || new Set(raw.orders.map(o => o?.id)).size !== raw.orders.length || raw.orders.filter(o => o.stage === 'assembling').length > 1) return false;
  for (const o of raw.orders) {
    if (!o || !integer(o.id, 1) || !text(o.name, 40) || !item(o.product) || !integer(o.quantity, 1, 6) || !Object.hasOwn(NEEDS, o.need) || !['accepted', 'assembling', 'packed'].includes(o.stage)) return false;
    if (![o.known, o.sliced, o.reservation].every(f => typeof f === 'boolean') || ![null, 'berry', 'cream', 'lemon'].includes(o.decoration) || ![null, 'paper', 'gift'].includes(o.packaging) || ![null, 'slicing', 'decorating'].includes(o.task)) return false;
    if (!integer(o.taskRemaining, 0, 3) || (o.task === null) !== (o.taskRemaining === 0) || !integer(o.createdAt, 0, DAY_SECONDS) || !integer(o.deadline, 1, 1000) || !finite(o.quote, 0)) return false;
    if (o.visitorId === null) { if (!o.reservation) return false; } else if (!raw.visitors.some(v => v.id === o.visitorId && v.stage === 'ordering')) return false;
    if (o.stage === 'accepted' ? o.items !== null : !o.items || !finite(o.items.quality, 0, 100) || !finite(o.items.age, 0) || !integer(o.items.at, 0, DAY_SECONDS)) return false;
    if (o.stage === 'packed' && (!o.packaging || o.task)) return false;
  }
  if (raw.orders.filter(o => o.reservation).length > 1 || (raw.reservationState === 'accepted') !== raw.orders.some(o => o.reservation)) return false;
  if (raw.phase === 'closed' && (raw.visitors.length || raw.orders.length || raw.jobs.length || raw.trays.length || raw.batches.length || !summaryValid(raw.lastSummary))) return false;
  if (raw.phase === 'prep' && raw.visitors.length) return false;
  if (!Array.isArray(raw.history) || raw.history.length > 30 || !raw.history.every(summaryValid)) return false;
  if (!Array.isArray(raw.events) || raw.events.length > 30 || raw.events.some(e => !e || !text(e.text, 1000) || !text(e.type, 30) || !finite(e.minute) || !integer(e.day, 1))) return false;
  if (!Array.isArray(raw.reviews) || raw.reviews.length > 20 || raw.reviews.some(r => !r || !integer(r.id, 1) || !integer(r.day, 1) || !text(r.name, 40) || !item(r.product) || !finite(r.score, 0, 100) || !text(r.comment))) return false;
  return true;
}
