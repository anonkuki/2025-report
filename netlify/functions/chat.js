/**
 * Netlify Function: /api/chat
 * 非流式聊天接口
 * API Key 通过 Netlify 环境变量 MINIMAX_API_KEY 注入，不写入代码
 */

const API_URL = 'https://api.minimaxi.com/anthropic/v1/messages';
const MODEL_NAME = 'MiniMax-M2.7';
const MAX_TOKENS = 1500;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async function (event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: '请求体 JSON 格式错误' }) };
    }

    const { messages = [], system = '' } = body;

    if (!messages.length) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'messages 不能为空' }),
        };
    }

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: '服务器未配置 API Key，请联系管理员' }),
        };
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                max_tokens: MAX_TOKENS,
                system,
                messages,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = (data.error && data.error.message) || JSON.stringify(data);
            return {
                statusCode: 502,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `API 调用失败: ${errMsg}` }),
            };
        }

        const textParts = (data.content || [])
            .filter(b => b.type === 'text')
            .map(b => b.text);

        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply: textParts.join('\n') }),
        };

    } catch (e) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: `服务器内部错误: ${e.message}` }),
        };
    }
};
