const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const root = join(__dirname, '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

function assertGuardedBeforeImplementation(source, marker) {
    const markerIndex = source.indexOf(marker);
    assert.notEqual(markerIndex, -1, `missing implementation marker: ${marker}`);

    const guard = "if (typeof AI_QA_AGENT_ENABLED === 'undefined' || !AI_QA_AGENT_ENABLED) {";
    const guardIndex = source.indexOf(guard, markerIndex);
    assert.notEqual(guardIndex, -1, 'missing default-off early-return guard');
    assert.ok(guardIndex - markerIndex < 500, 'guard must run before agent side effects');
}

test('QA agent stays disabled in source and exported report', () => {
    const config = read('backup/generator-config.js');
    const component = read('backup/components/ai-mascot.js');
    const exported = read('output/script.js');

    assert.match(config, /const AI_QA_AGENT_ENABLED = false;/);
    assert.match(exported, /const AI_QA_AGENT_ENABLED = false;/);
    assertGuardedBeforeImplementation(component, 'components/ai-mascot.js');
    assertGuardedBeforeImplementation(exported, 'components/ai-mascot.js');
});

test('disabled agent exits before touching the DOM', () => {
    const component = read('backup/components/ai-mascot.js');
    const executableComponent = component.split('// 生成器脚本缓存')[0];
    const sandbox = {
        AI_QA_AGENT_ENABLED: false,
        window: {},
    };

    vm.runInNewContext(executableComponent, sandbox);

    assert.equal(sandbox.window.YouziAgent, null);
    assert.equal('document' in sandbox, false);
});

test('QA backend endpoints are not published', () => {
    const netlifyConfig = read('netlify.toml');

    assert.doesNotMatch(netlifyConfig, /api\/chat|chat-stream|functions/i);
    assert.equal(existsSync(join(root, 'netlify/functions/chat.js')), false);
    assert.equal(existsSync(join(root, 'netlify/functions/chat-stream.js')), false);
    assert.equal(existsSync(join(root, 'netlify/functions/health.js')), false);
    assert.equal(existsSync(join(root, 'local-ai-proxy.js')), false);
});

test('generator cache keeps future exports disabled', () => {
    const sandbox = { window: {} };
    vm.runInNewContext(read('backup/module-sources.js'), sandbox);

    assert.equal(
        sandbox.window.__SC['components/ai-mascot.js'],
        read('backup/components/ai-mascot.js'),
    );
    assert.equal(
        sandbox.window.__SC['generator-config.js'],
        read('backup/generator-config.js'),
    );
});

test('published documentation does not advertise removed QA services', () => {
    for (const relativePath of ['README.md', 'output/README.md']) {
        const documentation = read(relativePath);
        assert.match(documentation, /问答 Agent 已关闭/);
        assert.doesNotMatch(documentation, /api\/chat|local-ai-proxy\.js/);
    }
});
