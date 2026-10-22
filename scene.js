import { PRODUCTS, getProduct, ovenStatus } from './game.js';

// A persistent canvas survives the dashboard's data updates. Customer identities
// and positions are keyed to engine visitors, never to a looping decoration.
export function createBakeryScene(canvas, { getState, isPaused, onSelect, getSelected, onDeliver }) {
  let ctx = canvas.getContext('2d');
  const front = ctx, background = document.createElement('canvas');
  let backgroundKey = '';
  const W = 1000, H = 520, poses = new Map();
  let frame, previous = performance.now(), clock = 0;
  let pixelRatio = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  canvas.setAttribute('role', 'img');
  const palettes = { sage: ['#75917b', '#355d49'], rose: ['#b48b83', '#7b514b'], sand: ['#b39a70', '#79643e'] };
  const skins = ['#e7bc97', '#d6aa83', '#efc6a4', '#e2ba95', '#e4b78c'];
  const coats = ['#b98d65', '#7a8d94', '#c69486', '#a09d7d', '#789a85'];

  function box(x, y, w, h, fill, radius = 0, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function ellipse(x, y, rx, ry, fill) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  }
  function line(points, color, width = 2) {
    ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p => ctx.lineTo(...p));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function text(value, x, y, size = 16, fill = '#6f775f', align = 'left', font = 'sans-serif') {
    ctx.font = `${size}px ${font}`; ctx.fillStyle = fill; ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function bread(id, x, y, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    if (id === 'cake') {
      box(-20, -25, 40, 27, '#ead0ac', 3); box(-20, -15, 40, 5, '#b96d68'); box(-21, -28, 42, 10, '#fff4e0', 4); ellipse(0, -33, 7, 9, '#bc6a55');
    } else if (id === 'tart') {
      ellipse(0, -5, 23, 11, '#b38346'); box(-22, -10, 44, 12, '#c89d5e', 4); ellipse(0, -11, 22, 11, '#e5cd76');
    } else if (id === 'toast') {
      box(-18, -31, 36, 35, '#b98348', 8); box(-14, -28, 28, 28, '#f1d6a1', 5);
    } else if (id === 'cinnamon') {
      ellipse(0, -7, 24, 14, '#be8949'); box(-23, -13, 46, 15, '#c79756', 6); ellipse(0, -14, 23, 13, '#dfb577');
      ctx.beginPath(); for (let t = 0; t < Math.PI * 5; t += .1) { const r = t * 1.2; const p = [Math.cos(t) * r, -14 + Math.sin(t) * r * .55]; if (!t) ctx.moveTo(...p); else ctx.lineTo(...p); } ctx.strokeStyle = '#976336'; ctx.lineWidth = 3; ctx.stroke();
    } else if (id === 'croissant') {
      ctx.beginPath(); ctx.moveTo(-28, 0); ctx.bezierCurveTo(-36, -25, -16, -35, -8, -25); ctx.bezierCurveTo(0, -37, 18, -30, 20, -21); ctx.bezierCurveTo(33, -22, 37, -9, 28, 1); ctx.lineTo(17, -10); ctx.quadraticCurveTo(0, 1, -18, -11); ctx.closePath(); ctx.fillStyle = '#d4a05b'; ctx.fill(); line([[-13, -25], [-8, -7]], '#f4d597', 3); line([[4, -28], [4, -5]], '#f4d597', 3); line([[18, -20], [13, -7]], '#f4d597', 3);
    } else {
      ellipse(0, -7, 25, 18, '#d6a363'); line([[-8, -22], [-12, -3]], '#f6d59b', 4); line([[9, -21], [6, -3]], '#f6d59b', 4);
    }
    ctx.restore();
  }
  function plant(x, y, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    line([[0, 0], [2, -65]], '#738761', 3);
    for (let i = 0; i < 5; i++) { const side = i % 2 ? 1 : -1, py = -15 - i * 10; ctx.save(); ctx.translate(side * 10, py); ctx.rotate(side * .7); ellipse(0, 0, 8, 18, i % 2 ? '#96a47b' : '#7c916a'); ctx.restore(); }
    box(-20, -4, 40, 9, '#c49978', 3); box(-16, 4, 32, 32, '#b38367', [0, 0, 9, 9]); ctx.restore();
  }
  function room(s) {
    const [accent, dark] = palettes[s.theme];
    box(0, 0, W, H, '#eee7d6');
    // Warm, sunlit wall and wooden floor.
    box(0, 0, W, 300, '#f2ecdd');
    for (let i = 0; i < 25; i++) line([[i * 43, 0], [i * 43, 300]], '#e8dfce', .8);
    box(0, 280, W, 15, accent); box(0, 295, W, 124, '#dbbd92');
    for (let y = 303; y < 420; y += 29) { line([[0, y], [W, y]], '#c8aa7f', 1); for (let x = (y % 2) * 64; x < W; x += 129) line([[x, y], [x, y + 28]], '#c8aa7f', 1); }
    box(0, 420, W, 100, '#d3ccba'); line([[0, 423], [1000, 423]], '#f3eddb', 4);
    for (let i = 0; i < 8; i++) line([[i * 150, 424], [i * 150 - 40, 520]], '#beb8a6', 1);
    line([[0, 469], [1000, 469]], '#beb8a6', 1);
    // Large window, linen curtains and the world outside.
    box(45, 44, 230, 190, '#b2c2b0', 5); box(53, 52, 214, 174, '#dce2ce', 2);
    ellipse(223, 86, 21, 21, '#f7e9ac');
    box(66, 164, 190, 61, '#bfc9b1'); box(81, 144, 45, 81, '#cdd3bd'); box(154, 153, 62, 72, '#c5cbb5');
    line([[159, 52], [159, 226]], '#8c9d80', 5); line([[53, 137], [267, 137]], '#8c9d80', 5);
    ctx.beginPath(); ctx.moveTo(45, 42); ctx.lineTo(96, 42); ctx.quadraticCurveTo(110, 140, 61, 191); ctx.lineTo(45, 191); ctx.closePath(); ctx.fillStyle = accent; ctx.fill();
    ctx.beginPath(); ctx.moveTo(277, 42); ctx.lineTo(226, 42); ctx.quadraticCurveTo(211, 140, 260, 191); ctx.lineTo(277, 191); ctx.closePath(); ctx.fill();
    box(36, 231, 249, 8, '#b99a74', 2);
    if ((s.day - 1) % 3 === 1) for (let i = 0; i < 16; i++) { const x = 63 + i * 12, y = 70 + ((i * 23 + clock * 70) % 140); line([[x, y], [x - 3, y + 12]], '#9faea1', 1); }
    // Sign, shelving and ornaments.
    text('麦 间', 503, 77, 32, dark, 'center', 'Georgia, serif');
    text('BREAD, BUTTER & BETTER DAYS', 503, 99, 8, '#9c967e', 'center');
    box(350, 122, 298, 13, '#af906a', 2);
    [375, 419, 473, 525, 570, 614].forEach((x, i) => { if (i % 2) { box(x - 10, 93, 19, 28, '#c5bca0', 4); box(x - 12, 90, 23, 6, '#9d9e7c', 2); } else bread(PRODUCTS[i].id, x, 120, .55); });
    box(701, 76, 91, 100, '#b6966f', 3); box(707, 82, 79, 88, dark, 2);
    text(s.phase === 'closed' ? 'SEE YOU' : 'FRESH', 747, 108, 16, '#eae7d0', 'center', 'Georgia');
    text(s.phase === 'closed' ? '明天见' : '今日新鲜', 747, 131, 12, '#eae7d0', 'center');
    text(s.discount ? '20% OFF' : 'baked with love', 747, 153, 10, '#c9d0b2', 'center', 'Georgia');
    // Door: movement happens on this actual route into the shop.
    box(825, 100, 134, 303, '#a48e6e', 4); box(833, 107, 118, 288, accent, 3);
    box(843, 116, 98, 205, '#c3d0b6', 2); line([[850, 127], [930, 304]], '#e6e9d4', 9);
    box(842, 331, 100, 53, dark, 2); ellipse(928, 315, 4, 4, '#d8bd7b');
    const doorBusy = s.visitors?.some(v => v.stage === 'arriving' || (v.stage === 'leaving' && v.remaining < 3));
    if (doorBusy) { box(845, 117, 76, 268, '#727e63'); box(843, 117, 31, 268, accent); }
    box(819, 397, 147, 9, '#a8997e', 2); box(806, 408, 173, 10, '#c0b297', 2);
    // An actual baker, behind the till.
    person({ look: 5, outcome: 'pending' }, 631, 276, false, clock, true);
    // Display cabinet: the number and type of loaves follows game stock.
    ellipse(321, 329, 252, 16, '#82694b22');
    box(65, 222, 491, 101, '#a77f56', 5); box(74, 227, 473, 89, '#c3a17a', 4);
    box(77, 230, 467, 61, '#e7e7cc', 4); box(77, 291, 467, 6, '#8d7856');
    ctx.fillStyle = '#fffdf022'; ctx.beginPath(); ctx.moveTo(80, 231); ctx.lineTo(260, 231); ctx.lineTo(365, 289); ctx.lineTo(190, 289); ctx.fill();
    let stocked = 0;
    PRODUCTS.forEach((p, i) => {
      const x = 116 + i * 75;
      box(x - 29, 271, 58, 5, '#c2ac86', 2);
      const n = Math.min(2, s.stock[p.id]);
      if (n) { bread(p.id, x - (n > 1 ? 10 : 0), 270, .62); if (n > 1) bread(p.id, x + 11, 272, .62); stocked += n; }
      text(s.unlocked.includes(p.id) ? `${s.stock[p.id]} 份` : '未研发', x, 286, 10, '#7d8067', 'center');
    });
    if (!stocked) text('等一炉新鲜出炉', 310, 257, 16, '#ac9f81', 'center');
    box(61, 313, 500, 15, '#967451', 3); box(82, 329, 458, 16, '#bf9e74', 2);
    // Checkout counter and register.
    box(571, 262, 142, 72, accent, 5); box(559, 253, 166, 13, '#b1976c', 3);
    box(623, 218, 50, 35, '#526655', 4); box(628, 223, 40, 18, '#c6d2b5', 2); text('¥', 649, 237, 14, '#5e7657', 'center');
    box(591, 269, 99, 48, '#ffffff12', 3); text('MAI JIAN', 641, 298, 12, '#f4eed7', 'center', 'Georgia');
    const assembling = s.orders.find(o => o.stage === 'assembling');
    if (assembling) { box(571, 240, 45, 7, '#c7b894', 2); bread(assembling.product, 594, 239, .55); if (assembling.sliced) line([[582, 217], [582, 235]], '#fff0c9', 2); }
    plant(38, 292, .8); plant(773, 327, 1.03);
    // Oven and steam only run for real baking jobs.
    box(321, 155, 190, 61, '#d0c4a8', 7); box(332, 166, 134, 39, '#686f58', 4);
    box(338, 172, 122, 26, s.jobs.length ? ovenStatus(s.jobs[0]).tone === 'golden' ? '#d3ab59' : ovenStatus(s.jobs[0]).tone === 'burnt' ? '#745c44' : '#b57d43' : '#858873', 3);
    if (s.jobs.length) {
      bread(s.jobs[0].product, 371, 193, .55); bread(s.jobs[0].product, 422, 193, .55);
      for (let i = 0; i < 3; i++) { const y = 155 - ((clock * 15 + i * 13) % 37); ctx.globalAlpha = .2 * (1 - (155 - y) / 37); line([[370 + i * 23, y], [376 + i * 23, y - 9], [370 + i * 23, y - 18]], '#a8987a', 3); ctx.globalAlpha = 1; }
    }
    ellipse(488, 175, 6, 6, '#a99a7b'); ellipse(488, 198, 4, 4, s.jobs.length ? '#da9c5b' : '#a7a389');
    text('MY LITTLE BAKERY', 74, 455, 9, '#8d8a74');
    text(s.phase === 'open' ? '门铃响起，又是一份小小的期待。' : s.phase === 'closed' ? '今天辛苦啦，明天见。' : '面包架准备好，就翻开营业牌吧。', 74, 476, 13, '#8c8c74');
  }

  function person(v, x, y, moving, t, baker = false) {
    const look = v.look, skin = skins[look] || '#e4ba94', coat = baker ? '#e8dfc3' : coats[look];
    const stride = moving && !reducedMotion ? Math.sin(t * 11 + v.id) * 7 : 0;
    ctx.save(); ctx.translate(x, y);
    ellipse(0, 0, 23, 6, '#6f665c24');
    line([[-8, -22], [-10 + stride, -3]], '#5e6c61', 9); line([[8, -22], [10 - stride, -3]], '#5e6c61', 9);
    line([[-10 + stride, -2], [-16 + stride, -2]], '#515d52', 5); line([[10 - stride, -2], [16 - stride, -2]], '#515d52', 5);
    box(-20, -60, 40, 40, coat, [12, 12, 5, 5]);
    line([[-20, -51], [-25 - stride * .4, -30]], skin, 7); line([[20, -51], [25 + stride * .4, -30]], skin, 7);
    if (look === 0 || look === 4) { box(-23, -57, 8, 25, '#aa8b67', 3); line([[-15, -55], [-15, -31]], '#6e816c', 3); }
    if (look === 1) { line([[0, -58], [0, -33]], '#f0ead7', 4); ctx.fillStyle = '#687976'; ctx.beginPath(); ctx.moveTo(-3, -52); ctx.lineTo(3, -52); ctx.lineTo(5, -35); ctx.lineTo(0, -30); ctx.lineTo(-4, -35); ctx.fill(); }
    if (look === 3) { box(-16, -58, 32, 7, '#d5c3a3', 4); }
    if (baker) { box(-14, -52, 28, 31, '#7f9676', 4); line([[-12, -57], [-12, -47]], '#7f9676', 3); line([[12, -57], [12, -47]], '#7f9676', 3); }
    ellipse(0, -77, 19, 21, look === 3 ? '#bdb9a6' : '#77624d');
    ellipse(0, -72, 17, 19, skin);
    ctx.beginPath(); ctx.moveTo(-18, -79); ctx.bezierCurveTo(-19, -104, 16, -104, 19, -77); ctx.quadraticCurveTo(6, -80, -1, -89); ctx.quadraticCurveTo(-5, -79, -18, -79); ctx.fillStyle = look === 3 ? '#d0c9b5' : '#6e5d49'; ctx.fill();
    if (look === 2) { ellipse(-19, -64, 7, 14, '#6e5d49'); ellipse(19, -64, 7, 14, '#6e5d49'); }
    if (look === 4) { ellipse(-23, -79, 6, 11, '#6e5d49'); ellipse(23, -79, 6, 11, '#6e5d49'); }
    if (baker) { box(-22, -106, 44, 22, '#fff7e3', 10); box(-18, -87, 36, 8, '#fff7e3', 2); }
    ellipse(-6, -73, 1.5, 2, '#635b49'); ellipse(6, -73, 1.5, 2, '#635b49');
    if (look === 3) { ctx.strokeStyle = '#8d8b76'; ctx.lineWidth = 1; ctx.strokeRect(-14, -79, 12, 10); ctx.strokeRect(2, -79, 12, 10); line([[-2, -75], [2, -75]], '#8d8b76', 1); }
    line([[-3, -64], [0, v.outcome === 'miss' ? -66 : -62], [3, -64]], '#ac7e63', 1.4);
    if (v.outcome === 'sale') {
      line([[25, -30], [30, -20]], '#c09869', 2); ctx.strokeStyle = '#a3875f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(31, -20, 7, Math.PI, 0); ctx.stroke(); box(19, -20, 25, 29, v.package === 'gift' ? '#c19a7b' : '#d9b67d', 3); text('麦', 31, 0, 10, '#8e7c55', 'center'); if (v.package === 'gift') { line([[20, -12], [43, -12]], '#ede0b8', 3); line([[31, -20], [31, 8]], '#ede0b8', 3); }
    }
    ctx.restore();
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function pathPoint(points, progress) {
    const n = Math.min(points.length - 1.00001, Math.max(0, progress) * (points.length - 1));
    const a = points[Math.floor(n)], b = points[Math.floor(n) + 1], t = n % 1;
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t) };
  }
  function target(v, s, subsecond = 0) {
    const progress = Math.min(1, 1 - v.remaining / v.duration + subsecond / v.duration);
    const slot = v.id % 3;
    if (v.stage === 'arriving') return pathPoint([[1040, 469], [883, 469], [883, 359]], progress);
    if (v.stage === 'browsing') return pathPoint([[883, 359], [410 + slot * 48, 360], [270 + slot * 48, 354]], progress);
    if (['waiting', 'ordering'].includes(v.stage)) {
      const q = s.visitors.filter(c => ['waiting', 'ordering'].includes(c.stage)).indexOf(v) + s.visitors.filter(c => c.stage === 'paying').length;
      return { x: 625 + q * 57, y: 365 + q * 11 };
    }
    if (v.stage === 'paying') return { x: 625, y: 353 };
    return pathPoint([[625, 356], [883, 367], [883, 469], [1060, 469]], progress);
  }
  function bubble(v, pose, selected) {
    const order = getState().orders.find(o => o.visitorId === v.id);
    const short = v.stage === 'arriving' ? '你好呀！' : v.stage === 'browsing' ? '让我挑一挑…' : v.stage === 'ordering' ? order?.stage === 'packed' ? '我的订单好啦？' : `等${getProduct(v.selected || v.requested).name}出餐` : v.stage === 'waiting' ? `${getProduct(v.selected || v.requested).name} ×${v.quantity}` : v.outcome === 'sale' ? '谢谢，下次见！' : '下次早点来…';
    const width = Math.min(192, Math.max(105, short.length * 14 + 20));
    const x = Math.max(width / 2 + 10, Math.min(990 - width / 2, pose.x)), y = pose.y - 139;
    box(x - width / 2, y, width, 29, selected ? '#f9efce' : '#fffdf0f5', 8, selected ? '#c5ad71' : '#ddd6bf');
    ctx.beginPath(); ctx.moveTo(x - 5, y + 29); ctx.lineTo(x, y + 36); ctx.lineTo(x + 6, y + 29); ctx.fillStyle = selected ? '#f9efce' : '#fffdf0'; ctx.fill();
    text(short, x, y + 20, 13, '#778266', 'center');
  }
  function draw(now) {
    const dt = Math.min(.08, Math.max(0, (now - previous) / 1000)); previous = now;
    if (!canvas.isConnected || document.hidden) { frame = requestAnimationFrame(draw); return; }
    const paused = isPaused(); if (!paused) clock += dt;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (pixelRatio !== dpr) { canvas.width = W * dpr; canvas.height = H * dpr; pixelRatio = dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = getState();
    const cacheKey = JSON.stringify([dpr, s.theme, s.day, s.phase, s.discount, s.stock, s.jobs.map(j => [j.product, j.elapsed]), s.orders.map(o => [o.product, o.stage, o.packaging, o.sliced]), s.visitors.some(v => v.stage === 'arriving' || (v.stage === 'leaving' && v.remaining < 3))]);
    if (backgroundKey !== cacheKey) {
      background.width = W * dpr; background.height = H * dpr;
      ctx = background.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      room(s); ctx = front; backgroundKey = cacheKey;
    }
    ctx.drawImage(background, 0, 0, W, H);
    const ids = new Set(s.visitors.map(v => v.id)); for (const id of poses.keys()) if (!ids.has(id)) poses.delete(id);
    const ordered = s.visitors.map(v => {
      const key = `${v.stage}:${v.remaining}`;
      if (!poses.has(v.id)) poses.set(v.id, { ...(v.stage === 'arriving' ? { x: 1030, y: 469 } : target(v, s)), key, since: clock });
      const pose = poses.get(v.id);
      if (pose.key !== key) { pose.key = key; pose.since = clock; }
      const to = target(v, s, Math.min(1, clock - pose.since));
      const distance = Math.hypot(to.x - pose.x, to.y - pose.y);
      if (!paused) { const speed = reducedMotion ? 1 : 1 - Math.exp(-dt * 5); pose.x = lerp(pose.x, to.x, speed); pose.y = lerp(pose.y, to.y, speed); }
      return { v, pose, moving: !paused && distance > 3 };
    }).sort((a, b) => a.pose.y - b.pose.y);
    const selected = getSelected();
    for (const { v, pose, moving } of ordered) {
      if (v.id === selected) { ctx.beginPath(); ctx.ellipse(pose.x, pose.y, 30, 9, 0, 0, Math.PI * 2); ctx.strokeStyle = '#b2a36b'; ctx.lineWidth = 2; ctx.stroke(); }
      person(v, pose.x, pose.y, moving, clock);
      text(v.name, pose.x, pose.y + 19, 12, '#6f7862', 'center');
      if (['waiting', 'ordering'].includes(v.stage)) { box(pose.x - 20, pose.y + 24, 40, 3, '#c1bea5', 2); box(pose.x - 20, pose.y + 24, 40 * v.remaining / v.duration, 3, '#8d9e71', 2); }
    }
    for (const { v, pose } of ordered) {
      if (v.stage === 'waiting' || v.stage === 'ordering' || v.stage === 'paying' || v.id === selected) bubble(v, pose, v.id === selected);
      if (v.stage === 'paying') {
        const age = Math.min(1, (v.duration - v.remaining + Math.min(1, clock - pose.since)) / v.duration);
        ctx.globalAlpha = 1 - age * .4;
        text(`+¥${v.paidAmount}${v.tip ? ' ♡' : ''}`, pose.x + 50, pose.y - 91 - (reducedMotion ? 0 : age * 28), 21, '#70864e', 'left', 'Georgia');
        ctx.globalAlpha = 1;
      }
    }
    if (paused && s.phase === 'open') { box(0, 0, W, H, '#f8f6eb22'); }
    frame = requestAnimationFrame(draw);
  }
  function closest(e) {
    const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) / rect.width * W, y = (e.clientY - rect.top) / rect.height * H;
    const match = [...poses].map(([id, p]) => ({ id, d: Math.hypot(p.x - x, p.y - 45 - y) })).sort((a, b) => a.d - b.d)[0];
    return match && match.d < 65 ? match.id : null;
  }
  function hit(e) { const id = closest(e); if (id !== null) onSelect(id); }
  function dragover(e) { if ([...(e.dataTransfer?.types || [])].includes('application/x-maijian-order')) e.preventDefault(); }
  function drop(e) { const orderId = Number(e.dataTransfer?.getData('application/x-maijian-order')); const id = closest(e); if (orderId && id !== null) { e.preventDefault(); onDeliver?.(orderId, id); } }
  canvas.addEventListener('click', hit); canvas.addEventListener('dragover', dragover); canvas.addEventListener('drop', drop);
  frame = requestAnimationFrame(draw);
  return { destroy() { cancelAnimationFrame(frame); canvas.removeEventListener('click', hit); canvas.removeEventListener('dragover', dragover); canvas.removeEventListener('drop', drop); } };
}
