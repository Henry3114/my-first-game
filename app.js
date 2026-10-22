import { PRODUCTS, UPGRADES, REGULARS, getProduct, createGame, bake, advance, openShop, closeShop, nextDay, fulfillOrder, buyUpgrade, research, capacity, occupied, weatherFor, reputationLabel, dailyTarget, upgradeCost, orderFor, validateSave, hydrateGame, VISITOR_STAGES, greetVisitor, waitVisitor, recommendVisitor, serveVisitor } from './game.js';
import { icon, pastry } from './art.js';
import { createBakeryScene } from './scene.js';

const SAVE_KEY = 'maijian-bakery-v1';
let storageOK = true, loadMessage = '', state = load(), view = 'shop', modal = null, toastTimer;
let sceneCanvas = null, bakeryScene = null, selectedVisitorId = null;
const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const money = n => `¥${Math.round(n).toLocaleString('zh-CN')}`;
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const time = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const action = (name, label, cls = 'button', extra = '') => `<button class="${cls}" data-action="${name}" ${extra}>${label}</button>`;

function load() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (text) {
      const raw = JSON.parse(text);
      if (validateSave(raw)) return hydrateGame(raw);
      localStorage.setItem(`${SAVE_KEY}-backup`, text);
      loadMessage = '旧存档格式异常，已保留备份，并为你开启新小店。';
    }
  } catch { loadMessage = '无法读取存档，已开启新小店。请在设置中导出备份。'; }
  return createGame();
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); storageOK = true; }
  catch { if (storageOK) toast('浏览器存储不可用，请通过设置导出存档。'); storageOK = false; }
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3800);
}
function run(fn, success) {
  const result = fn();
  if (result?.error) toast(result.error);
  else if (success) toast(success);
  save(); render();
}

function sidebar() {
  return `<aside class="sidebar">
    <a class="brand" href="#" data-action="shop" aria-label="麦间首页"><span class="brand-mark">${icon('wheat')}</span><span class="brand-name">麦间<span>MAI JIAN BAKERY</span></span></a>
    <div class="sidebar-label">一间小店，一点理想</div>
    <nav aria-label="主导航">${[
      ['shop', 'shop', '我的小店', '01'], ['recipes', 'book', '烘焙食谱', '02'], ['upgrades', 'leaf', '小店成长', '03'], ['journal', 'journal', '街角日记', '04'],
    ].map(([id, glyph, label, no]) => action(id, `${icon(glyph)}<span>${label}</span><small>${no}</small>`, `nav-item ${view === id ? 'active' : ''}`, `aria-current="${view === id ? 'page' : 'false'}"`)).join('')}</nav>
    <div class="sidebar-bottom"><div class="little-note">${icon('wheat')}<p>面包会有的，<br>喜欢的生活也是。</p><span>A LITTLE BETTER, EVERY DAY</span></div>
    <div class="save-status">${icon(storageOK ? 'check' : 'close')}<span>${storageOK ? '进度已自动保存' : '存档不可用 · 请导出'}</span></div>
    ${action('settings', `${icon('settings')} 偏好与存档`, 'settings-button')}</div>
  </aside>`;
}

function header() {
  const names = { shop: ['经营手记', '小小的店，热腾腾的日常。', '揉进一点耐心，等待美好出炉。'], recipes: ['风味收藏', '把喜欢的味道，留在食谱里。', '从一只餐包，到属于你的招牌。'], upgrades: ['慢慢成长', '让小店，变成理想的模样。', '每一份努力，都有看得见的回响。'], journal: ['街角来信', '面包之外，还有日常的故事。', '记住来过的人，也记住走过的每一天。'] };
  const [eyebrow, title, sub] = names[view];
  return `<header class="topbar"><div class="breadcrumb">麦间烘焙 <span>/</span> ${eyebrow}</div><div class="topbar-right"><span class="day-badge">DAY ${String(state.day).padStart(2, '0')}</span><span class="day-label">${state.day % 7 === 0 ? '周末时光' : '又是美好的一天'}</span>${action('pause', icon(state.paused ? 'play' : 'pause'), `icon-button ${state.paused ? 'selected' : ''}`, `aria-label="${state.paused ? '继续游戏' : '暂停游戏'}" title="${state.paused ? '继续' : '暂停'}"`)}${action('settings', icon('settings'), 'icon-button', 'aria-label="打开设置"')}</div></header>
  <div class="page-heading"><div><p class="eyebrow">${eyebrow} <span>THE CORNER BAKERY</span></p><h1>${title}</h1><p class="subtitle">${sub}</p></div><div class="heading-action">${state.phase === 'prep' ? action('open', `${icon('shop')} 开始营业 ${icon('arrow')}`, 'button primary') : state.phase === 'open' ? action('close-confirm', `${icon('shop')} 提前打烊`, 'button outline') : action('next', `开启新一天 ${icon('arrow')}`, 'button primary')}<span>${state.paused ? '时间已暂停，慢慢安排吧' : state.phase === 'prep' ? '备好面包，就开门迎客吧' : state.phase === 'open' ? '欢迎光临，今日好好营业' : '辛苦啦，明天也值得期待'}</span></div></div>`;
}

function metrics() {
  const w = weatherFor(state);
  return `<section class="metrics" aria-label="经营概况">
    <article class="metric"><span class="metric-icon">${icon('coin')}</span><div><span class="metric-label">小店零钱</span><strong data-testid="cash">${money(state.cash)}</strong><small>把每一点积累，变成喜欢的样子</small></div></article>
    <article class="metric"><span class="metric-icon terracotta">${icon('chart')}</span><div><span class="metric-label">今日营业额</span><strong>${money(state.stats.revenue)}<em>/ ${money(dailyTarget(state))}</em></strong><small>达成今日心愿，额外奖励 ¥40</small></div></article>
    <article class="metric"><span class="metric-icon gold">${icon('heart')}</span><div><span class="metric-label">街坊口碑</span><strong>${state.reputation}<em>/ 100</em><span class="rep-tag">${reputationLabel(state)}</span></strong><small>${state.totalServed} 位客人的日常，与你有了交集</small></div></article>
    <article class="metric weather"><span class="metric-icon">${icon(w.icon)}</span><div><span class="metric-label">今日天气</span><strong>${w.name}<em>第 ${state.day} 天</em></strong><small>${w.label}</small></div></article>
  </section>`;
}

function shopScene() {
  const stage = state.phase === 'prep' ? '准备中' : state.phase === 'open' ? '营业中' : '已打烊';
  const jobs = state.jobs;
  return `<section class="scene-card panel"><div class="panel-heading"><h2>街角的麦间 <span>YOUR LITTLE BAKERY</span></h2><span class="status-pill ${state.phase}"><i></i>${stage}</span></div>
    <div class="shop-scene live-scene theme-${state.theme} ${state.phase === 'open' && !state.paused ? 'is-open' : ''}">
      <canvas id="bakery-canvas" width="1000" height="520" aria-label="烘焙店营业现场：顾客从店门进入，挑选面包、在柜台付款后提袋离开。可点击人物选择互动。"></canvas>
      <div class="live-scene-heading"><span>${icon('shop')} 营业现场</span><span>${state.paused ? '已暂停' : state.phase === 'open' ? `${state.visitors.length} 位客人在店里` : state.phase === 'closed' ? '明天见' : '等待第一位客人'}</span></div>
    </div>
    <div class="visitor-roster" aria-label="店内顾客">${state.visitors.length ? state.visitors.map(v => action(`visitor:${v.id}`, `<i class="visitor-dot look-${v.look}"></i><span>${esc(v.name)}<small>${VISITOR_STAGES[v.stage]}</small></span>${v.stage === 'paying' ? `<b>+${money(v.paidAmount)}</b>` : ''}`, `visitor-chip ${selectedGuest()?.id === v.id ? 'active' : ''}`, `aria-pressed="${selectedGuest()?.id === v.id}"`)).join('') : `<span class="roster-empty">${icon('people')} ${state.phase === 'open' ? '门铃随时会响起，留一点新鲜给街坊。' : '开门后，顾客会进店挑选，也会在柜台和你聊天。'}</span>`}</div>
    <div class="shop-clock"><span>${icon('clock')}<b>${time(state.minute)}</b><small>营业时间 09:00 — 18:00</small></span><div class="time-track"><i style="width:${Math.max(0, (state.minute - 540) / 540 * 100)}%"></i></div><span class="clock-end">${state.phase === 'prep' ? '开门前时间不流逝' : state.phase === 'closed' ? '今日营业结束' : '每秒 = 店内 5 分钟'}</span></div>
    <div class="oven-strip"><div class="oven-label">${icon('oven')}<div><strong>我的烤箱</strong><span>${jobs.length} / ${state.upgrades.oven + 1} 个烤位使用中</span></div></div><div class="oven-slots">${Array.from({ length: 1 + state.upgrades.oven }, (_, i) => {
      const j = jobs[i];
      return j ? `<div class="oven-job"><span>${getProduct(j.product).name} <b>${j.remaining}s</b></span><div class="progress"><i style="width:${(1 - j.remaining / j.duration) * 100}%"></i></div></div>` : action('bake:roll', `${icon('plus')} 烤一炉餐包 · ¥18`, 'oven-empty', `aria-label="空闲烤位，烤一炉奶油餐包，食材18元" ${state.phase === 'closed' ? 'disabled' : ''}`);
    }).join('')}</div></div>
  </section>`;
}

function selectedGuest() {
  return state.visitors.find(v => v.id === selectedVisitorId)
    || state.visitors.find(v => v.stage === 'waiting')
    || state.visitors.find(v => v.stage === 'paying')
    || state.visitors.find(v => v.stage === 'browsing')
    || state.visitors[0];
}
function conversationCard() {
  const v = selectedGuest();
  if (!v) return `<section class="conversation-card panel empty-conversation"><div class="panel-heading"><h2>柜台小对话</h2>${icon('heart')}</div><div class="conversation-empty">${icon('people')}<h3>${state.phase === 'open' ? '门铃响起，就有新的故事。' : '美味之外，也想听听你的日常。'}</h3><p>点选店内人物，可以打招呼、推荐现货，或请客人等一炉。客人也会自己挑选和结账。</p></div></section>`;
  const pending = v.outcome === 'pending', waiting = v.stage === 'waiting';
  const canGreet = pending && ['waiting', 'browsing'].includes(v.stage);
  const desired = getProduct(v.selected || v.requested);
  const hasStock = (v.selected ? state.stock[v.selected] > 0 : v.favorites.some(id => state.stock[id] > 0));
  return `<section class="conversation-card panel" data-visitor-id="${v.id}"><div class="panel-heading"><h2>柜台小对话 <span>LET'S SAY HELLO</span></h2><span class="conversation-stage">${VISITOR_STAGES[v.stage]}</span></div><div class="conversation-body"><div class="speaker"><div class="guest-portrait look-${v.look}"><span>${esc(v.name.slice(-1))}</span>${v.regular ? icon('heart') : ''}</div><div><h3>${esc(v.name)}<span>${v.regular ? '熟悉的街坊' : '今天的新朋友'}</span></h3><p>${pending ? `想买 ${desired.name} × ${v.quantity}` : v.outcome === 'sale' ? `已付款 ${money(v.paidAmount)}${v.tip ? ' · 含小费 ¥2' : ''}` : '这次没有买到，下次早点来'}</p></div></div><blockquote class="guest-speech">“${esc(v.line)}”</blockquote>${pending ? `<div class="guest-patience"><span>${waiting ? '还愿意等一会儿' : '正沿着面包香走来'}</span><span>${waiting ? `${v.remaining} 秒` : VISITOR_STAGES[v.stage]}</span></div><div class="progress"><i style="width:${waiting ? v.remaining / v.duration * 100 : 100}%"></i></div><div class="conversation-actions">${action(`greet:${v.id}`, `${icon(v.greeted ? 'check' : 'heart')} ${v.greeted ? '已经聊过' : '热情招呼'}`, 'button outline', `${!canGreet || v.greeted ? 'disabled' : ''}`)}${action(`wait:${v.id}`, `${icon('clock')} ${v.waitUsed ? '正在等出炉' : '请等一炉'}`, 'button outline', `${!waiting || v.waitUsed ? 'disabled' : ''}`)}</div>${waiting ? `<div class="recommendations"><span>${v.recommended ? '客人已接受推荐，准备打包吧' : '也可以推荐现货'}</span><div>${PRODUCTS.filter(p => state.stock[p.id] > 0).map(p => action(`recommend:${v.id}:${p.id}`, p.name, 'recommend-button', v.recommended ? 'disabled' : '')).join('') || '<small>面包架空啦，先烤一炉吧</small>'}</div></div>` : ''}${action(`serve:${v.id}`, `${icon('gift')} 打包结账 ${waiting && hasStock ? icon('arrow') : ''}`, 'button primary full', !waiting || !hasStock ? 'disabled' : '')}` : `<div class="purchase-receipt">${icon(v.outcome === 'sale' ? 'check' : 'heart')}<span>${v.outcome === 'sale' ? `已取走 ${getProduct(v.selected).name} × ${v.quantity}，谢谢你的用心。` : '备好喜欢的面包，下次再相遇。'}</span></div>`}</div></section>`;
}

function orderPanel() {
  const o = orderFor(state), p = getProduct(o.product), count = Math.min(o.quantity, state.stock[o.product]);
  return `<aside class="today-column">${conversationCard()}<section class="order-card panel"><div class="panel-heading"><h2>街坊的预订</h2>${icon('gift')}</div><div class="order-paper"><span class="paper-pin"></span><div class="order-top"><span class="order-number">ORDER #${String(state.day).padStart(3, '0')}</span><span class="handwritten">给今天一点期待</span></div><h3>${o.name}</h3><p>“想把这份香甜，也分享给身边的人。”</p><div class="order-product">${pastry(o.product)}<div><strong>${p.name} × ${o.quantity}</strong><span>今日交付 · 口碑 +3</span></div></div><div class="order-reward"><span>一份暖心回报</span><b>${money(o.reward)}</b></div><div class="order-progress"><span>${state.orderDone ? '谢谢你，已经收到啦' : `已备好 ${count} / ${o.quantity} 份`}</span><span>${state.orderDone ? '100' : Math.round(count / o.quantity * 100)}%</span></div><div class="progress"><i style="width:${state.orderDone ? 100 : count / o.quantity * 100}%"></i></div></div>${action('fulfill', state.orderDone ? `${icon('check')} 预订已完成` : `交付预订 ${icon('arrow')}`, `button ${state.orderDone ? 'completed' : 'primary'} full`, `${state.orderDone || state.phase === 'closed' ? 'disabled' : ''}`)}</section>
</aside>`;
}

function productCard(p, recipeView = false) {
  const unlocked = state.unlocked.includes(p.id), job = state.jobs.find(j => j.product === p.id);
  return `<article class="product-card ${!unlocked ? 'is-locked' : ''}"><div class="product-art art-${p.id}">${pastry(p.id)}<span class="product-tag">${!unlocked ? `${icon('lock')} 新风味` : p.id === 'roll' ? '店长推荐' : p.id === 'croissant' ? '酥香人气' : p.audience}</span>${unlocked ? `<span class="stock-count">在售 <b>${state.stock[p.id]}</b></span>` : ''}</div><div class="product-body"><div class="product-title"><div><h3>${p.name}</h3><span>${p.en}</span></div><strong>${money(Math.round(p.price * (state.discount ? 0.8 : 1)))}<small>/ 份</small></strong></div><p>${p.description}</p><div class="product-meta"><span>${icon('clock')} ${Math.ceil(p.time * (state.upgrades.helper ? 0.65 : 1))} 秒 / 炉</span><span>6 份 · 食材 ${money(p.cost)}</span></div>${unlocked ? action(`bake:${p.id}`, `${icon(job ? 'oven' : 'plus')} ${job ? '再烤一炉' : '烤一炉'}<span>−${money(p.cost)}</span>`, 'button bake-button full', `data-key="bake-${p.id}" ${state.phase === 'closed' ? 'disabled' : ''}`) : action(`research:${p.id}`, `${icon('lock')} ${state.reputation < p.unlock ? `口碑 ${p.unlock} 解锁研发` : `研发配方 · ${money(p.research)}`}`, 'button research-button full', `${state.reputation < p.unlock ? 'disabled' : ''}`)}${recipeView ? `<div class="recipe-profit">每炉满售收益 <b>+${money(p.price * 6 - p.cost)}</b><span>未扣水电与工资</span></div>` : ''}</div></article>`;
}

function menu() {
  return `<section class="menu-section"><div class="section-heading"><div><h2>今日的面包架 <span>TODAY'S FRESH BAKES</span></h2><p>一炉六份，刚刚好的香气。</p></div><div class="menu-tools"><span class="capacity">${occupied(state)} / ${capacity(state)} 陈列位</span>${action('discount', `<span class="switch ${state.discount ? 'on' : ''}"><i></i></span> 八折促销`, 'discount-button', `role="switch" aria-checked="${state.discount}"`)}${action('recipes', `全部食谱 ${icon('arrow')}`, 'text-button')}</div></div><div class="product-grid">${PRODUCTS.filter(p => state.unlocked.includes(p.id)).map(p => productCard(p)).join('')}</div></section>`;
}

function recipes() {
  return `<div class="section-intro"><span class="tag">${icon('book')} 已掌握 ${state.unlocked.length} / ${PRODUCTS.length} 份配方</span><p>每一款新品，都是小店新的可能。研发会消耗零钱，解锁后即可烘焙。</p></div><div class="product-grid recipe-grid">${PRODUCTS.map(p => productCard(p, true)).join('')}</div>`;
}

function upgrades() {
  return `<div class="growth-banner"><div><span class="eyebrow">LITTLE BY LITTLE</span><h2>不必很快，慢慢变好。</h2><p>更大的烤箱、更亮的招牌。把赚来的零钱，花在你期待的未来。</p></div>${icon('wheat')}</div><div class="upgrade-grid">${UPGRADES.map(u => `<article class="upgrade-card panel"><div class="upgrade-icon">${icon(u.icon)}</div><div class="upgrade-heading"><h3>${u.name}</h3><span>Lv. ${state.upgrades[u.id]} / ${u.max}</span></div><p>${u.description}</p><div class="upgrade-dots">${Array.from({ length: u.max }, (_, i) => `<i class="${i < state.upgrades[u.id] ? 'filled' : ''}"></i>`).join('')}</div>${action(`upgrade:${u.id}`, state.upgrades[u.id] >= u.max ? `${icon('check')} 已升至满级` : `升级设备 <span>${money(upgradeCost(state, u))} ${icon('arrow')}</span>`, 'button outline full', state.upgrades[u.id] >= u.max ? 'disabled' : '')}</article>`).join('')}</div><section class="decoration panel"><div><span class="eyebrow">A TOUCH OF YOU</span><h2>给小店，换一种心情。</h2><p>喜欢的颜色，本身就是一种奖励。门面配色免费更换。</p></div><div class="theme-options">${[['sage', '鼠尾草绿'], ['rose', '落日玫瑰'], ['sand', '蜂蜜暖棕']].map(([id, label]) => action(`theme:${id}`, `<i class="theme-swatch ${id}">${state.theme === id ? icon('check') : ''}</i><span>${label}</span>`, `theme-button ${state.theme === id ? 'active' : ''}`, `aria-pressed="${state.theme === id}"`)).join('')}</div></section>`;
}

function journal() {
  return `<section class="regulars"><div class="section-heading"><div><h2>那些熟悉的身影 <span>OUR NEIGHBOURS</span></h2><p>一份面包，慢慢变成一份惦记。</p></div><span class="tag">${icon('heart')} ${state.totalServed} 次温暖相遇</span></div><div class="regular-grid">${REGULARS.map(r => { const count = state.affection[r.id], level = Math.min(2, Math.floor(Math.max(0, count - 1) / 4)); return `<article class="regular-card panel"><div class="avatar" style="--avatar-color:${r.color}">${r.initial}<span>${icon('heart')}</span></div><div><h3>${r.name}<small>${count >= 9 ? '老朋友' : count >= 4 ? '渐渐熟悉' : '初次相识'}</small></h3><span class="muted">${r.tag}</span><p>${count ? r.stories[level] : '还没正式认识，备好喜欢的面包，等一次温暖相遇。'}</p><div class="friendship">${Array.from({ length: 5 }, (_, i) => icon('heart', i < Math.ceil(count / 2) ? 'filled-heart' : '')).join('')}<span>暖心互动 ${count} 次</span></div></div></article>`; }).join('')}</div></section>
    <div class="journal-columns"><section class="panel journal-feed"><div class="panel-heading"><h2>小店流水笺</h2><span class="muted">最近 30 条</span></div>${state.events.length ? state.events.map(e => `<div class="feed-item"><span class="feed-icon ${esc(e.type)}">${icon(e.type === 'sale' ? 'coin' : e.type === 'regular' ? 'heart' : e.type === 'miss' ? 'people' : 'wheat')}</span><div><p>${esc(e.text)}</p><small>第 ${e.day} 天 · ${time(e.minute)}</small></div></div>`).join('') : '<div class="empty-state">还没有故事。烤一炉面包，故事就开始了。</div>'}</section><section class="panel history-panel"><div class="panel-heading"><h2>营业小结</h2>${icon('chart')}</div>${state.history.length ? state.history.map(h => `<article class="history-row"><div><b>第 ${h.day} 天</b><small>售出 ${h.sold} 份 · 招待 ${h.served} 人</small></div><strong class="${h.profit >= 0 ? 'positive' : 'negative'}">${h.profit >= 0 ? '+' : '−'}${money(Math.abs(h.profit))}<small>营业结余</small></strong></article>`).join('') : '<div class="empty-state">结束第一天营业后，<br>这里会记住你的努力。</div>'}</section></div>`;
}

function render() {
  const focused = document.activeElement?.dataset.action;
  app.innerHTML = `${sidebar()}<main>${header()}${metrics()}<div class="page-content">${view === 'shop' ? `<div class="shop-layout">${shopScene()}${orderPanel()}</div>${menu()}` : view === 'recipes' ? recipes() : view === 'upgrades' ? upgrades() : journal()}</div><footer>麦间 · 街角烘焙日记 v1.1 <span>把平凡的日子，烤得香一点。</span><span>慢慢来，好味道值得等待 ${icon('wheat')}</span></footer></main>`;
  if (view === 'shop') {
    const placeholder = app.querySelector('#bakery-canvas');
    if (sceneCanvas) placeholder.replaceWith(sceneCanvas);
    else {
      sceneCanvas = placeholder;
      bakeryScene = createBakeryScene(sceneCanvas, {
        getState: () => state,
        isPaused: () => state.paused || !!modal || document.hidden,
        getSelected: () => selectedGuest()?.id,
        onSelect: id => { selectedVisitorId = id; render(); },
      });
    }
  }
  if (focused) app.querySelector(`[data-action="${focused}"]`)?.focus({ preventScroll: true });
}

function openModal(kind) {
  modal = kind;
  let content;
  if (kind === 'summary') {
    const h = state.lastSummary;
    if (!h) return;
    content = `<div class="summary-art">${icon('wheat')}</div><p class="eyebrow">DAY ${String(h.day).padStart(2, '0')} · A DAY WELL SPENT</p><h2>今天的努力，香气满满。</h2><p class="modal-subtitle">${h.early ? '提前收好小店，也给自己留一点时间。' : '灯光暗下来，今天的故事先写到这里。'}</p><div class="summary-main"><span>今日营业结余</span><strong class="${h.profit >= 0 ? '' : 'negative'}">${h.profit >= 0 ? '+' : '−'}${money(Math.abs(h.profit))}</strong></div><dl class="summary-ledger"><div><dt>面包与预订收入</dt><dd>${money(h.revenue)}</dd></div><div><dt>食材、水电${state.upgrades.helper ? '与工资' : ''}</dt><dd>−${money(h.expense)}</dd></div><div><dt>余量 ${h.waste} 份 · 闭店折价回收</dt><dd>+${money(h.clearance)}</dd></div><div><dt>今日心愿 ${h.goalMet ? '达成' : '未达成'}</dt><dd>+${money(h.bonus)}</dd></div></dl><div class="summary-people"><span>${icon('people')} 招待 ${h.served} 位客人</span><span>${icon('shop')} 售出 ${h.sold} 份美味</span></div><p class="fine-print">闭店时，未出炉的批次一并完成。剩余面包按售价的约 25% 回收，不隔夜销售。设备与配方投资不计入营业结余。</p>${action('next', `收好今天，迎接明天 ${icon('arrow')}`, 'button primary full')}${action('dismiss', '先看看今天的小店', 'text-button full')}`;
  } else if (kind === 'close-confirm') {
    content = `${icon('shop', 'modal-symbol')}<p class="eyebrow">CLOSE FOR TODAY</p><h2>今天就营业到这里？</h2><p class="modal-subtitle">当前时间 ${time(state.minute)}。剩余面包会折价回收，正在烤的批次会一并结算，今天未交付的预订将结束。</p>${action('close', '确认打烊', 'button primary full')}${action('dismiss', '再经营一会儿', 'button outline full')}`;
  } else if (kind === 'reset-confirm') {
    content = `${icon('leaf', 'modal-symbol')}<h2>重新开一家小店？</h2><p class="modal-subtitle">这会清除当前进度。建议先回到设置导出存档，留住这段日子。</p>${action('reset', '确认重新开始', 'button danger full')}${action('settings', '返回，先保留进度', 'button outline full')}`;
  } else {
    content = `<p class="eyebrow">MAKE YOURSELF AT HOME</p><h2>留住小店的每一天。</h2><p class="modal-subtitle">游戏会自动保存在当前浏览器中。清理浏览器数据或更换设备前，记得导出一份存档。</p><div class="settings-group"><h3>存档与备份</h3>${action('export', `${icon('journal')} 导出存档 ${icon('arrow')}`, 'button outline full')}<label class="button outline full import-button">${icon('book')} 导入存档<input type="file" id="import-save" accept=".json,application/json" /></label></div><div class="settings-group"><h3>经营小贴士</h3><p>选一款面包，每炉烤 6 份。开门后能看见顾客进店、挑选和结账，可以点人物聊天、推荐现货或请等一炉，也可以让顾客自动购买。每天 09:00–18:00 约 108 秒；备货阶段只运行烤箱。暂停或打开弹窗时，时间停止。</p><p>八折促销会降低售价，并让顾客更愿意尝试其他口味。预订每天一份，营业前后都能交付。</p><p>天气与周末会影响客流。错过心愿也没关系，明天还有新机会。</p></div>${action('reset-confirm', '重新开始游戏', 'text-button danger-text full')}`;
  }
  modalRoot.innerHTML = `<div class="modal-overlay"><section class="modal ${kind === 'summary' ? 'summary-modal' : ''}" role="dialog" aria-modal="true" aria-label="${kind === 'summary' ? '今日营业结算' : '小店设置'}" tabindex="-1">${action('dismiss', icon('close'), 'icon-button modal-close', 'aria-label="关闭弹窗"')}${content}</section></div>`;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => modalRoot.querySelector('.modal')?.focus());
}

function dismiss() { modal = null; modalRoot.innerHTML = ''; document.body.classList.remove('modal-open'); }

document.addEventListener('click', e => {
  const target = e.target.closest('[data-action]');
  if (!target || target.disabled) return;
  e.preventDefault();
  const [name, id, extra] = target.dataset.action.split(':');
  if (['shop', 'recipes', 'upgrades', 'journal'].includes(name)) { view = name; dismiss(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
  else if (name === 'visitor') { selectedVisitorId = Number(id); render(); }
  else if (name === 'greet') { selectedVisitorId = Number(id); run(() => greetVisitor(state, id)); }
  else if (name === 'wait') { selectedVisitorId = Number(id); run(() => waitVisitor(state, id)); }
  else if (name === 'recommend') { selectedVisitorId = Number(id); run(() => recommendVisitor(state, id, extra)); }
  else if (name === 'serve') { selectedVisitorId = Number(id); run(() => serveVisitor(state, id)); }
  else if (name === 'bake') run(() => bake(state, id), '面团送进烤箱啦，稍等片刻。');
  else if (name === 'open') run(() => openShop(state), '营业牌已翻开，欢迎第一位客人！');
  else if (name === 'fulfill') run(() => fulfillOrder(state), '预订已送出，感谢你的用心！');
  else if (name === 'upgrade') run(() => buyUpgrade(state, id), '升级完成，小店又变好了！');
  else if (name === 'research') run(() => research(state, id), '新配方已收好，可以烤一炉试试啦！');
  else if (name === 'theme') { state.theme = id; save(); render(); toast('门面配色已更换，在我的小店看看吧。'); }
  else if (name === 'discount') { state.discount = !state.discount; save(); render(); toast(state.discount ? '八折促销已开启，顾客更愿意尝试不同口味。' : '恢复原价，用好味道留住客人。'); }
  else if (name === 'pause') { state.paused = !state.paused; save(); render(); }
  else if (['settings', 'close-confirm', 'reset-confirm', 'summary'].includes(name)) openModal(name);
  else if (name === 'dismiss') dismiss();
  else if (name === 'close') { dismiss(); run(() => closeShop(state)); openModal('summary'); }
  else if (name === 'next') { dismiss(); run(() => nextDay(state)); }
  else if (name === 'reset') { state = createGame(); selectedVisitorId = null; view = 'shop'; dismiss(); save(); render(); toast('新的小店，新的一天。欢迎回来。'); }
  else if (name === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `麦间-第${state.day}天.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('存档已导出，替你留住这段日子。');
  }
});

document.addEventListener('change', async e => {
  if (e.target.id !== 'import-save') return;
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 1000000) throw Error('存档文件过大。');
    const raw = JSON.parse(await file.text());
    if (!validateSave(raw)) throw Error('存档格式不正确，原来的进度已保留。');
    if (!window.confirm(`载入第 ${raw.day} 天的存档？这将替换当前进度。`)) return;
    state = hydrateGame(raw); selectedVisitorId = null; view = 'shop'; dismiss(); save(); render(); toast('存档载入成功，小店等你很久啦。');
    if (state.phase === 'closed') openModal('summary');
  } catch (error) { toast(error instanceof SyntaxError ? '无法解析存档，请选择导出的 JSON 文件。' : error.message); }
  finally { e.target.value = ''; }
});

document.addEventListener('keydown', e => {
  if (!modal) return;
  if (e.key === 'Escape') dismiss();
  if (e.key === 'Tab') {
    const items = [...modalRoot.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')];
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && (document.activeElement === first || document.activeElement.classList.contains('modal'))) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }
});
modalRoot.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) dismiss(); });
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', save);
setInterval(() => {
  if (modal || document.hidden || state.paused || state.phase === 'closed') return;
  const previous = state.phase;
  advance(state); save(); render();
  if (previous === 'open' && state.phase === 'closed') openModal('summary');
}, 1000);
render(); save();
if (loadMessage) toast(loadMessage);
if (state.phase === 'closed') openModal('summary');
