/* ═══════════════════════════════════════════════════════════════
   Icon Generator 학습 데이터 빌더
   전 세계 공용 오픈소스 아이콘 세트를 하나의 검색 인덱스로 합친다.
   - Lucide (ISC)            : lucide-static/icon-nodes.json + tags.json
   - Tabler Outline (MIT)    : @tabler/icons/tabler-nodes-outline.json + icons.json
   - Tabler Filled (MIT)     : @tabler/icons/tabler-nodes-filled.json
   출력: public/assets/icons/icon-index.json
   형식: { sets, icons: [[name, setCode, tags, innerSvg, complexity], ...] }
   실행: npm run icons
   ═══════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(readFileSync(resolve(root, 'node_modules', p), 'utf8'));

const lucideNodes = read('lucide-static/icon-nodes.json');
const lucideTags = read('lucide-static/tags.json');
const tablerOutline = read('@tabler/icons/tabler-nodes-outline.json');
const tablerFilled = read('@tabler/icons/tabler-nodes-filled.json');
const tablerMeta = read('@tabler/icons/icons.json');

const esc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function serialize(nodes) {
  return nodes
    .filter(([tag, attrs]) => !(tag === 'path' && attrs.d === 'M0 0h24v24H0z')) // Tabler 바운딩 박스 제거
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .filter(([k]) => k !== 'key')
        .map(([k, v]) => `${k}="${esc(v)}"`)
        .join(' ');
      return `<${tag} ${a}/>`;
    })
    .join('');
}

function complexity(nodes) {
  let score = 0;
  for (const [tag, attrs] of nodes) {
    if (tag === 'path' && attrs.d === 'M0 0h24v24H0z') continue;
    score += 3;
    if (attrs.d) score += (attrs.d.match(/[a-zA-Z]/g) || []).length;
    if (attrs.points) score += attrs.points.trim().split(/\s+/).length / 2;
  }
  return Math.round(score);
}

const icons = [];
const add = (name, set, tags, nodes) => {
  const inner = serialize(nodes);
  if (!inner) return;
  icons.push([name, set, [...new Set(tags.map(t => String(t).toLowerCase()))].join('|'), inner, complexity(nodes)]);
};

for (const [name, nodes] of Object.entries(lucideNodes)) add(name, 'L', lucideTags[name] || [], nodes);
for (const [name, nodes] of Object.entries(tablerOutline)) {
  const m = tablerMeta[name] || {};
  add(name, 'T', [...(m.tags || []), m.category || ''].filter(Boolean), nodes);
}
for (const [name, nodes] of Object.entries(tablerFilled)) {
  const m = tablerMeta[name] || {};
  add(name, 'F', [...(m.tags || []), m.category || '', 'filled', 'solid'].filter(Boolean), nodes);
}

const out = resolve(root, 'public/assets/icons/icon-index.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({
  sets: { L: 'Lucide (ISC)', T: 'Tabler Outline (MIT)', F: 'Tabler Filled (MIT)' },
  icons,
}));
console.log(`icon-index.json: ${icons.length} icons`);

