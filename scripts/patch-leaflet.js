import fs from 'fs';
import path from 'path';

// Patch Leaflet distribution files so that getPosition(el) never crashes if el is undefined
const targets = [
  'node_modules/leaflet/dist/leaflet-src.js',
  'node_modules/leaflet/dist/leaflet-src.esm.js',
  'node_modules/leaflet/src/dom/DomUtil.js',
  'node_modules/.vite/deps/leaflet.js',
];

targets.forEach((rel) => {
  const filePath = path.resolve(rel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let patched = content.replace(
      /function getPosition\(el\)\s*\{\s*(\/\/[^\n]*\n\s*)*return el\._leaflet_pos \|\| new Point\(0, 0\);/g,
      'function getPosition(el) {\n\tif (!el) return new Point(0, 0);\n\treturn el._leaflet_pos || new Point(0, 0);'
    );
    // Also patch minified or bundler format if present
    patched = patched.replace(
      'function getPosition(el) {\n\t\t\treturn el._leaflet_pos || new Point(0, 0);\n\t\t}',
      'function getPosition(el) {\n\t\t\tif (!el) return new Point(0, 0);\n\t\t\treturn el._leaflet_pos || new Point(0, 0);\n\t\t}'
    );
    if (patched !== content) {
      fs.writeFileSync(filePath, patched, 'utf8');
      console.log('Successfully patched Leaflet at:', rel);
    }
  }
});

// Patch Vite client to silently handle WebSocket closed without opened in iframe/preview environments where HMR WS is disabled
const viteClientFiles = [
  'node_modules/vite/dist/client/client.mjs',
];

viteClientFiles.forEach((rel) => {
  const filePath = path.resolve(rel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let patched = content;
    
    // Prevent unhandled rejection on transport.connect
    if (patched.includes('transport.connect(createHMRHandler(handleMessage));')) {
      patched = patched.replace(
        'transport.connect(createHMRHandler(handleMessage));',
        'transport.connect(createHMRHandler(handleMessage)).catch(() => {});'
      );
    }
    
    // Don't reject if WebSocket closed without opening (benign when HMR is off/proxied)
    if (patched.includes('reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));')) {
      patched = patched.replace(
        'reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));',
        '/* silent in iframe */ resolve();'
      );
    }

    if (patched !== content) {
      fs.writeFileSync(filePath, patched, 'utf8');
      console.log('Successfully patched Vite client at:', rel);
    }
  }
});
