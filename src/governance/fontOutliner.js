/* ═══════════════════════════════════════════════════════════════════════════
   VITALBEAUTIE Font Outliner
   - TrueType Font (.ttf) 파서 및 텍스트 -> SVG 베지에 패스 (Create Outlines) 변환 엔진
   - 인쇄·일러스트레이터(.ai) 출력 시 시스템 폰트 유실/점표시(• • •)를 100% 방지하고
     RIX-신고딕 / 아리따돋움 / Raleway 본래 서체 외곽선을 순수 벡터 패스로 재현
   ═══════════════════════════════════════════════════════════════════════════ */

class TTFParser {
  constructor(buffer) {
    this.buf = buffer;
    this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const numTables = this.view.getUint16(4);
    this.tables = {};
    for (let i = 0; i < numTables; i++) {
      let tag = '';
      for (let j = 0; j < 4; j++) tag += String.fromCharCode(this.view.getUint8(12 + i * 16 + j));
      this.tables[tag] = {
        off: this.view.getUint32(12 + i * 16 + 8),
        len: this.view.getUint32(12 + i * 16 + 12),
      };
    }

    const headOff = this.tables['head']?.off || 0;
    this.upm = headOff ? this.view.getUint16(headOff + 18) : 1000;
    this.locFmt = headOff ? this.view.getInt16(headOff + 50) : 1;
    this.glyfOff = this.tables['glyf']?.off || 0;
    this.locaOff = this.tables['loca']?.off || 0;
    const hheaOff = this.tables['hhea']?.off || 0;
    this.numHMetrics = hheaOff ? this.view.getUint16(hheaOff + 34) : 0;
    this.hmtxOff = this.tables['hmtx']?.off || 0;

    this.cmap = {};
    this.parseCmap();
  }

  parseCmap() {
    if (!this.tables['cmap']) return;
    const cmapOff = this.tables['cmap'].off;
    const numSub = this.view.getUint16(cmapOff + 2);
    for (let i = 0; i < numSub; i++) {
      const soff = this.view.getUint32(cmapOff + 4 + i * 8 + 4);
      const sub = cmapOff + soff;
      const fmt = this.view.getUint16(sub);
      if (fmt === 4) {
        const segCount = this.view.getUint16(sub + 6) / 2;
        const endCodes = [];
        for (let s = 0; s < segCount; s++) endCodes.push(this.view.getUint16(sub + 14 + s * 2));
        const startCodes = [];
        for (let s = 0; s < segCount; s++) startCodes.push(this.view.getUint16(sub + 16 + segCount * 2 + s * 2));
        const idDeltas = [];
        for (let s = 0; s < segCount; s++) idDeltas.push(this.view.getInt16(sub + 16 + segCount * 4 + s * 2));
        const idRangeOffsetsPos = sub + 16 + segCount * 6;
        for (let s = 0; s < segCount; s++) {
          const roff = this.view.getUint16(idRangeOffsetsPos + s * 2);
          for (let c = startCodes[s]; c <= endCodes[s]; c++) {
            if (c === 0xffff) continue;
            let gid = 0;
            if (roff === 0) {
              gid = (c + idDeltas[s]) & 0xffff;
            } else {
              const p = idRangeOffsetsPos + s * 2 + roff + (c - startCodes[s]) * 2;
              gid = this.view.getUint16(p);
              if (gid !== 0) gid = (gid + idDeltas[s]) & 0xffff;
            }
            if (gid && !this.cmap[c]) this.cmap[c] = gid;
          }
        }
      }
    }
  }

  getGid(code) {
    return this.cmap[code] || 0;
  }

  getAdvance(gid) {
    if (!this.hmtxOff) return this.upm * 0.6;
    if (gid < this.numHMetrics) return this.view.getUint16(this.hmtxOff + gid * 4);
    return this.view.getUint16(this.hmtxOff + (this.numHMetrics - 1) * 4);
  }

  getGlyphContours(gid) {
    if (!this.glyfOff || !this.locaOff) return [];
    let gOff = 0;
    let gLen = 0;
    if (this.locFmt === 0) {
      gOff = this.view.getUint16(this.locaOff + gid * 2) * 2;
      gLen = this.view.getUint16(this.locaOff + (gid + 1) * 2) * 2 - gOff;
    } else {
      gOff = this.view.getUint32(this.locaOff + gid * 4);
      gLen = this.view.getUint32(this.locaOff + (gid + 1) * 4) - gOff;
    }
    if (gLen === 0) return [];

    const numContours = this.view.getInt16(this.glyfOff + gOff);
    if (numContours > 0) {
      let p = this.glyfOff + gOff + 10;
      const endPts = [];
      for (let i = 0; i < numContours; i++) {
        endPts.push(this.view.getUint16(p));
        p += 2;
      }
      const numPoints = endPts[numContours - 1] + 1;
      const instrLen = this.view.getUint16(p);
      p += 2 + instrLen;

      const flags = [];
      while (flags.length < numPoints) {
        const f = this.view.getUint8(p++);
        flags.push(f);
        if (f & 0x08) {
          const count = this.view.getUint8(p++);
          for (let j = 0; j < count; j++) flags.push(f);
        }
      }

      const xs = [];
      let curX = 0;
      for (let i = 0; i < numPoints; i++) {
        const f = flags[i];
        if (f & 0x02) {
          const b = this.view.getUint8(p++);
          curX += (f & 0x10) ? b : -b;
        } else if (!(f & 0x10)) {
          curX += this.view.getInt16(p);
          p += 2;
        }
        xs.push(curX);
      }

      const ys = [];
      let curY = 0;
      for (let i = 0; i < numPoints; i++) {
        const f = flags[i];
        if (f & 0x04) {
          const b = this.view.getUint8(p++);
          curY += (f & 0x20) ? b : -b;
        } else if (!(f & 0x20)) {
          curY += this.view.getInt16(p);
          p += 2;
        }
        ys.push(curY);
      }

      const contours = [];
      let startIdx = 0;
      for (let c = 0; c < numContours; c++) {
        const endIdx = endPts[c];
        const pts = [];
        for (let i = startIdx; i <= endIdx; i++) {
          pts.push({ x: xs[i], y: ys[i], on: (flags[i] & 0x01) !== 0 });
        }
        contours.push(pts);
        startIdx = endIdx + 1;
      }
      return contours;
    } else if (numContours < 0) {
      let p = this.glyfOff + gOff + 10;
      const contours = [];
      const MORE = 0x0020;
      let flags = 0;
      do {
        flags = this.view.getUint16(p);
        const subGid = this.view.getUint16(p + 2);
        p += 4;
        let dx = 0;
        let dy = 0;
        if (flags & 0x0001) {
          dx = this.view.getInt16(p);
          dy = this.view.getInt16(p + 2);
          p += 4;
        } else {
          dx = this.view.getInt8(p);
          dy = this.view.getInt8(p + 1);
          p += 2;
        }
        let a = 1, b = 0, c = 0, d = 1;
        if (flags & 0x0008) {
          a = d = this.view.getInt16(p) / 16384;
          p += 2;
        } else if (flags & 0x0040) {
          a = this.view.getInt16(p) / 16384;
          d = this.view.getInt16(p + 2) / 16384;
          p += 4;
        } else if (flags & 0x0080) {
          a = this.view.getInt16(p) / 16384;
          b = this.view.getInt16(p + 2) / 16384;
          c = this.view.getInt16(p + 4) / 16384;
          d = this.view.getInt16(p + 6) / 16384;
          p += 8;
        }
        const subContours = this.getGlyphContours(subGid);
        for (const contour of subContours) {
          contours.push(contour.map(pt => ({
            x: a * pt.x + c * pt.y + dx,
            y: b * pt.x + d * pt.y + dy,
            on: pt.on,
          })));
        }
      } while (flags & MORE);
      return contours;
    }
    return [];
  }
}

// Global font caches
const fontCache = {
  bold: null,
  light: null,
  medium: null,
};

let fontLoadPromise = null;

export async function preloadFonts() {
  if (fontCache.bold && fontCache.light) return fontCache;
  if (fontLoadPromise) return fontLoadPromise;

  fontLoadPromise = (async () => {
    const loadFont = async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const arr = await res.arrayBuffer();
          return new TTFParser(new Uint8Array(arr));
        }
      } catch (e) {
        // Fallback or ignore
      }
      return null;
    };

    const [bold, light, medium] = await Promise.all([
      loadFont('./assets/fonts/AritaDotumKR-Bold.ttf'),
      loadFont('./assets/fonts/AritaDotumKR-Light.ttf'),
      loadFont('./assets/fonts/AritaDotumKR-Medium.ttf'),
    ]);

    fontCache.bold = bold;
    fontCache.light = light;
    fontCache.medium = medium || light;
    return fontCache;
  })();

  return fontLoadPromise;
}

/**
 * 텍스트 세그먼트 배열을 받아 TrueType 베지에 외곽선 SVG 패스 문자열로 합성
 */
export function renderStringToOutlines(font, text, fontSize, startX, startY, anchor = 'start', letterSpacing = 0) {
  if (!font || !text) return '';
  const scale = fontSize / font.upm;
  const ls = letterSpacing || 0;
  let totalAdv = 0;
  const glyphs = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') {
      totalAdv += font.upm * 0.32 * scale + ls;
      continue;
    }
    const gid = font.getGid(ch.charCodeAt(0));
    const adv = (font.getAdvance(gid) || (font.upm * 0.6)) * scale + ls;
    glyphs.push({ gid, x: totalAdv, adv });
    totalAdv += adv;
  }

  let ox = startX;
  if (anchor === 'middle') ox -= totalAdv / 2;
  else if (anchor === 'end') ox -= totalAdv;

  const allOps = [];
  for (const g of glyphs) {
    const contours = font.getGlyphContours(g.gid);
    for (const c of contours) {
      if (!c.length) continue;
      let startPt = c[0];
      let pts = c.slice();
      if (!startPt.on) {
        if (pts[pts.length - 1].on) {
          startPt = pts.pop();
          pts.unshift(startPt);
        } else {
          startPt = { x: (pts[0].x + pts[pts.length - 1].x) / 2, y: (pts[0].y + pts[pts.length - 1].y) / 2, on: true };
          pts.unshift(startPt);
        }
      }
      const sx = +(startPt.x * scale + ox + g.x).toFixed(3);
      const sy = +(-startPt.y * scale + startY).toFixed(3);
      allOps.push(`M ${sx} ${sy}`);

      let i = 1;
      while (i < pts.length) {
        const pt = pts[i];
        if (pt.on) {
          allOps.push(`L ${+(pt.x * scale + ox + g.x).toFixed(3)} ${+(-pt.y * scale + startY).toFixed(3)}`);
          i++;
        } else {
          const nextPt = (i + 1 < pts.length) ? pts[i + 1] : startPt;
          if (nextPt.on) {
            allOps.push(`Q ${+(pt.x * scale + ox + g.x).toFixed(3)} ${+(-pt.y * scale + startY).toFixed(3)} ${+(nextPt.x * scale + ox + g.x).toFixed(3)} ${+(-nextPt.y * scale + startY).toFixed(3)}`);
            i += 2;
          } else {
            const mid = { x: (pt.x + nextPt.x) / 2, y: (pt.y + nextPt.y) / 2 };
            allOps.push(`Q ${+(pt.x * scale + ox + g.x).toFixed(3)} ${+(-pt.y * scale + startY).toFixed(3)} ${+(mid.x * scale + ox + g.x).toFixed(3)} ${+(-mid.y * scale + startY).toFixed(3)}`);
            i++;
          }
        }
      }
      allOps.push('Z');
    }
  }

  return allOps.join(' ');
}

/**
 * SVG 내부의 모든 <text> 요소를 순수 벡터 <path> 윤곽선(Create Outlines)으로 전면 교체
 */
export async function convertSvgToVectorOutlines(svgStr) {
  const fonts = await preloadFonts();
  if (!fonts.bold || !fonts.light) return svgStr;

  // DOMParser를 사용해 안전하게 SVG 트리 파싱 및 <text> 교체
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgStr, 'image/svg+xml');
  const textNodes = [...doc.querySelectorAll('text')];

  if (!textNodes.length) return svgStr;

  for (const textEl of textNodes) {
    // textPath는 원호 텍스트이므로 기존 엔진 아크 기하로 처리
    if (textEl.querySelector('textPath')) continue;

    const x = parseFloat(textEl.getAttribute('x') || 0);
    const y = parseFloat(textEl.getAttribute('y') || 0);
    const anchor = (textEl.getAttribute('text-anchor') || 'start').toLowerCase();
    const fill = textEl.getAttribute('fill') || '#ffffff';
    const opacity = textEl.getAttribute('opacity') || '1';
    const mainFontSize = parseFloat(textEl.getAttribute('font-size') || 10);
    const mainWeight = textEl.getAttribute('font-weight') || 'normal';

    const tspans = [...textEl.querySelectorAll('tspan')];

    if (tspans.length > 0) {
      // 복합 tspan 처리 (예: 라인명 Bold + 제품명 Light)
      const segments = tspans.map(t => {
        const txt = t.textContent || '';
        const weight = t.getAttribute('font-weight') || mainWeight;
        const isBold = Number(weight) >= 600 || /bold/i.test(weight);
        const font = isBold ? fonts.bold : fonts.light;
        const scale = mainFontSize / font.upm;
        let segAdv = 0;
        for (const ch of txt) {
          if (ch === ' ') {
            segAdv += font.upm * 0.32 * scale;
            continue;
          }
          const gid = font.getGid(ch.charCodeAt(0));
          segAdv += (font.getAdvance(gid) || (font.upm * 0.6)) * scale;
        }
        return { txt, font, isBold, segAdv, el: t };
      });

      const totalW = segments.reduce((acc, s) => acc + s.segAdv, 0);
      let curX = x;
      if (anchor === 'middle') curX -= totalW / 2;
      else if (anchor === 'end') curX -= totalW;

      const groupEl = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      if (opacity !== '1') groupEl.setAttribute('opacity', opacity);

      for (const seg of segments) {
        const d = renderStringToOutlines(seg.font, seg.txt, mainFontSize, curX, y, 'start');
        if (d) {
          const pathEl = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathEl.setAttribute('fill', fill);
          pathEl.setAttribute('d', d);
          groupEl.appendChild(pathEl);
        }
        curX += seg.segAdv;
      }

      textEl.parentNode.replaceChild(groupEl, textEl);
    } else {
      const plainText = textEl.textContent || '';
      if (!plainText.trim()) continue;

      const isBold = Number(mainWeight) >= 600 || /bold/i.test(mainWeight);
      const isMedium = Number(mainWeight) >= 500 && !isBold;
      const font = isBold ? fonts.bold : isMedium ? fonts.medium : fonts.light;

      const d = renderStringToOutlines(font, plainText, mainFontSize, x, y, anchor);
      if (d) {
        const pathEl = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('fill', fill);
        if (opacity !== '1') pathEl.setAttribute('opacity', opacity);
        pathEl.setAttribute('d', d);
        textEl.parentNode.replaceChild(pathEl, textEl);
      }
    }
  }

  return new XMLSerializer().serializeToString(doc.documentElement);
}

