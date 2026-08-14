const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const backupDir = join(__dirname, '..', 'backup');
const modulePaths = [
    'components/ai-mascot.js',
    'components/dept-renderers.js',
    'components/influence-dashboard.js',
    'components/lightbox.js',
    'components/report-slides.js',
    'data-processor.js',
    'file-io.js',
    'final-transmission-assets.js',
    'generator-config.js',
    'generator-ui.js',
    'mascot-asset-data.js',
    'product-effects.js',
    'product-reading-mode.js',
    'product-runtime.js',
    'utils.js',
];

const preloaded = Object.fromEntries(
    modulePaths.map((relativePath) => [
        relativePath,
        readFileSync(join(backupDir, relativePath), 'utf8'),
    ]),
);

const output = `(function(){\n` +
    `  var preloaded = ${JSON.stringify(preloaded)};\n` +
    `  window.__SC = window.__SC || {};\n` +
    `  for (var k in preloaded) {\n` +
    `    if (Object.prototype.hasOwnProperty.call(preloaded, k) && !window.__SC[k]) {\n` +
    `      window.__SC[k] = preloaded[k];\n` +
    `    }\n` +
    `  }\n` +
    `})();\n`;

writeFileSync(join(backupDir, 'module-sources.js'), output, 'utf8');
