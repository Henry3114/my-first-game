export function pastry(id, className = '') {
  const drawings = {
    roll: `<ellipse cx="100" cy="126" rx="60" ry="10" fill="#b18a52" opacity=".13"/><path d="M37 103c-3-30 16-57 45-57 10-12 42-7 47 5 28 1 44 35 34 59-9 22-115 25-126-7Z" fill="url(#dough)"/><path d="M83 48c-9 17-15 38-12 61M126 51c-6 16-9 37-6 54" stroke="#f9daa0" stroke-width="6" stroke-linecap="round"/><path d="M45 107c36 12 79 12 113-2" stroke="#b57536" stroke-width="2" opacity=".5"/>`,
    toast: `<ellipse cx="100" cy="134" rx="59" ry="8" fill="#b18a52" opacity=".13"/><path d="M49 67c-7-33 13-47 34-38 11-10 32-10 42 1 26-7 41 14 30 37v62H49Z" fill="#ad6e37"/><path d="M55 67c-7-27 12-39 29-30 13-10 28-9 40 1 20-8 33 11 23 30v55H55Z" fill="url(#dough)"/><path d="M66 69c-8-17 5-27 20-20 12-8 23-8 35 1 15-6 25 6 17 20v42H66Z" fill="#f4ddb0"/><path d="M85 58v48M104 57v48M123 62v43" stroke="#e9cb95" stroke-width="2" stroke-dasharray="2 6"/>`,
    croissant: `<ellipse cx="100" cy="128" rx="66" ry="8" fill="#b18a52" opacity=".13"/><path d="M37 117c-19-25 3-63 27-65 11-26 60-28 74 1 30 7 43 41 26 62l-18-16c-5-11-12-10-18-5-15 15-40 14-55-1-8-6-15 3-17 10Z" fill="url(#dough)"/><path d="m65 54 9 39m17-52 2 59m22-59-8 60m29-47-15 39M45 75l18 17m92-18-16 17" stroke="#aa632f" stroke-width="4" stroke-linecap="round"/><path d="m68 61 7 22m17-34 1 42m21-42-5 41m24-28-9 21" stroke="#f7d28b" stroke-width="4" stroke-linecap="round"/>`,
    cinnamon: `<ellipse cx="101" cy="130" rx="61" ry="8" fill="#b18a52" opacity=".13"/><path d="M43 75h114v42c-13 29-101 26-114-1Z" fill="#ba7843"/><ellipse cx="100" cy="76" rx="57" ry="39" fill="url(#dough)"/><path d="M147 80c-2-47-95-39-95-6s75 37 82 5-55-26-61-10 31 25 40 10-17-14-18-5" stroke="#92532e" stroke-width="6" fill="none" stroke-linecap="round"/><path d="m60 56 3 40 16-42 5 42 17-47 5 46 17-41 3 33 15-23" stroke="#f8e8cb" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
    cake: `<ellipse cx="101" cy="133" rx="64" ry="8" fill="#b18a52" opacity=".13"/><path d="m52 72 58-30 49 31v55H52Z" fill="#f0d4b3"/><path d="M52 88h107v14H52Z" fill="#c8776d"/><path d="M52 102h107v9H52Z" fill="#fff0dc"/><path d="m52 70 57-31 50 32v12c-9 13-17-6-27 2s-15-6-25 0-18-5-27 1-20 4-28-2Z" fill="#fff7e8"/><path d="M97 58c-18-17-1-37 10-25 12-14 29 4 10 25-7 5-14 5-20 0Z" fill="#c66f5a"/><path d="m107 34-2-12m2 12-9-7m9 7 10-9" stroke="#718758" stroke-width="3" stroke-linecap="round"/><path d="m100 44 2 2m12-6 2 2m-7 10 1 2" stroke="#f5d298" stroke-width="2"/>`,
    tart: `<ellipse cx="100" cy="130" rx="63" ry="8" fill="#b18a52" opacity=".13"/><path d="m41 86 9 34c17 21 84 22 102-1l8-34Z" fill="#b78348"/><path d="m51 96 7 25m8-21 5 27m10-27 2 30m15-29v30m15-32-2 31m16-34-4 29m17-34-5 27" stroke="#e3b772" stroke-width="5"/><ellipse cx="100" cy="85" rx="59" ry="34" fill="#e7ba6a"/><ellipse cx="100" cy="83" rx="49" ry="27" fill="#f3dc86"/><path d="M85 75c-1-15 15-17 15-29 0 12 20 17 17 30Z" fill="#fff6db"/><path d="m125 72 4-25c18 4 25 15 24 30Z" fill="#f6e9a4"/><path d="m129 47 24 30-28-5Z" stroke="#d2b95b" stroke-width="2"/><path d="M93 52c-12-1-16-9-16-9 13-4 16 9 16 9Z" fill="#819b63"/>`,
  };
  return `<svg class="pastry ${className}" viewBox="0 0 200 160" aria-hidden="true"><defs><linearGradient id="dough" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#edc184"/><stop offset=".5" stop-color="#dca05c"/><stop offset="1" stop-color="#bf7e3e"/></linearGradient></defs>${drawings[id] || drawings.roll}</svg>`;
}
const paths = {
  wheat: '<path d="m7 21 11-18M12 12C5 13 4 7 4 7c7-1 8 5 8 5Zm4-6C10 6 11 1 11 1c5 0 5 5 5 5Zm-7 12c-7 1-8-5-8-5 7-2 8 5 8 5Zm4-6c1-7 7-7 7-7 1 6-7 7-7 7Zm-4 6c3-7 9-6 9-6-1 6-9 6-9 6Z"/>',
  shop: '<path d="M3 10v11h18V10M2 10l3-7h14l3 7M8 3l-1 7m9-7 1 7M2 10c1 3 4 3 5 0 1 3 4 3 5 0 1 3 4 3 5 0 1 3 4 3 5 0M9 21v-7h6v7"/>',
  book: '<path d="M12 5v16M12 5C9 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-7-2-10 1Z"/>',
  chart: '<path d="M4 3v18h17M8 16v-4m5 4V7m5 9V4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  cloud: '<path d="M6 18a5 5 0 1 1 1-10 7 7 0 0 1 13 3 4 4 0 0 1-1 7Z"/>',
  rain: '<path d="M6 15a5 5 0 1 1 1-10 7 7 0 0 1 13 3 4 4 0 0 1-1 7ZM8 19l-1 3m6-3-1 3m6-3-1 3"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  oven: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 8h18M7 5.5h.1m4 0h.1M7 12h10v6H7Z"/>',
  people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-3-5"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-2v4m-2-2h4"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  leaf: '<path d="M20 3C7 2 0 10 6 17s16-1 14-14ZM5 20l10-11"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13m0-13C3 9 4 0 8 3l4 5Zm0 0c9 1 8-8 4-5l-4 5Z"/>',
  journal: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h4M2 7h4M2 12h4M2 17h4"/>',
};
export function icon(name, className = '') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkles}</svg>`; }
