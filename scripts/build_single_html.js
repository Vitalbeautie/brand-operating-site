import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');
const desktopDir = '/Users/amore/Desktop';
const outputFile = path.join(distDir, 'VITALBEAUTIE_Brand_Operating_System.html');

console.log('Building standalone single HTML bundle...');

// 1. Read dist/index.html
const indexHtmlPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 2. Find CSS and JS assets
const cssMatch = html.match(/<link[^>]*rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/);
const jsMatch = html.match(/<script[^>]*src="\.\/assets\/([^"]+)"[^>]*><\/script>/);

if (!cssMatch || !jsMatch) {
  console.error('Failed to locate CSS or JS bundle in dist/index.html');
  process.exit(1);
}

const cssFilename = cssMatch[1];
const jsFilename = jsMatch[1];

let cssContent = fs.readFileSync(path.join(distDir, 'assets', cssFilename), 'utf8');
let jsContent = fs.readFileSync(path.join(distDir, 'assets', jsFilename), 'utf8');

// 3. Collect and embed all public image assets into base64 data URIs
const mimeMap = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const imageCache = new Map();

function getBase64DataUri(relPath) {
  const cleanRel = relPath.replace(/^\.\//, '');
  if (imageCache.has(cleanRel)) return imageCache.get(cleanRel);

  const fullPath = path.join(publicDir, cleanRel);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).toLowerCase();
    const mime = mimeMap[ext] || 'application/octet-stream';
    const data = fs.readFileSync(fullPath).toString('base64');
    const uri = `data:${mime};base64,${data}`;
    imageCache.set(cleanRel, uri);
    return uri;
  }
  return null;
}

// Replace image references in jsContent and cssContent
const assetRegex = /\.\/assets\/(logos|guidelines|products|icons)\/[a-zA-Z0-9_\-\.]+\.(png|jpg|jpeg|svg|webp)/g;

let jsReplacedCount = 0;
jsContent = jsContent.replace(assetRegex, (match) => {
  const uri = getBase64DataUri(match);
  if (uri) {
    jsReplacedCount++;
    return uri;
  }
  return match;
});

let cssReplacedCount = 0;
cssContent = cssContent.replace(assetRegex, (match) => {
  const uri = getBase64DataUri(match);
  if (uri) {
    cssReplacedCount++;
    return uri;
  }
  return match;
});

console.log(`Embedded ${jsReplacedCount} images into JS, ${cssReplacedCount} into CSS.`);

// 3.5. Replace import.meta and escape </script to allow pure classic script execution on file:// protocol without CORS blocking
jsContent = jsContent.replace(/import\.meta\.url/g, 'window.location.href');
jsContent = jsContent.replace(/import\.meta/g, '({url:window.location.href})');
jsContent = jsContent.replace(/<\/script/gi, '<\\/script');

// 4. Inline CSS into <head> and JS into end of <body>
// Replace CSS link with <style>
html = html.replace(cssMatch[0], () => `<style>\n${cssContent}\n</style>`);

// Remove original JS script tag from <head>
html = html.replace(jsMatch[0], '');

// Insert JS script before </body> with DOMContentLoaded guard so DOM elements (#sidebar, #content) always exist
const scriptTag = `
<script>
(function() {
  function __runApp() {
    try {
      ${jsContent}
    } catch (e) {
      console.error("Fatal app runtime error:", e);
      var errDiv = document.createElement("div");
      errDiv.style.cssText = "position:fixed;top:0;left:0;right:0;background:#FEF2F2;border-bottom:2px solid #EF4444;color:#B91C1C;padding:16px 20px;font-size:13px;z-index:999999;font-family:monospace;white-space:pre-wrap;";
      errDiv.textContent = "오류 발생: " + (e && e.stack ? e.stack : e);
      document.body.prepend(errDiv);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __runApp);
  } else {
    __runApp();
  }
})();
</script>
`;

html = html.replace('</body>', () => `${scriptTag}\n</body>`);

// 5. Write standalone HTML to dist and Desktop
fs.writeFileSync(outputFile, html, 'utf8');
const stat = fs.statSync(outputFile);
const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);

const desktopHtmlPath = path.join(desktopDir, 'VITALBEAUTIE_Brand_Operating_System.html');
try {
  fs.writeFileSync(desktopHtmlPath, html, 'utf8');
  console.log(`Copied standalone HTML to Desktop: ${desktopHtmlPath}`);
} catch (e) {
  console.warn(`Could not write directly to Desktop (sandbox restriction): ${e.message}`);
}

console.log(`Successfully generated standalone HTML: ${outputFile} (${sizeMb} MB)`);
