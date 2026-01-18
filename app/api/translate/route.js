import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { text, targetLang = 'en', sourceLang = 'id' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Use POST to avoid URL length limits with large content
        // MOVE sl and tl to URL, keep q in body
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t`;

        console.log(`[Translate API] Translating ${text.length} chars from ${sourceLang} to ${targetLang}`);

        const formData = new URLSearchParams();
        formData.append('q', text);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: formData.toString()
        });

        console.log(`[Translate API] Upstream status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upstream Translation Error:', response.status, errorText);
            throw new Error(`Translation service failed with status ${response.status}`);
        }

        const data = await response.json();

        // Safe parsing of the nested array response
        // Format is typically: [[["translated", "source", ...], ...], ...]
        if (!data || !Array.isArray(data) || !data[0]) {
            // Sometimes it returns just the array if simple? No, usually nested.
            // If Google blocks, it returns HTML (caught by response.ok check above usually, but maybe 200 OK with captcha?)
            console.error("Invalid Structure:", JSON.stringify(data).substring(0, 200));
            throw new Error('Unexpected response format from translation service');
        }

        const paragraphs = data[0];
        if (!Array.isArray(paragraphs)) {
            throw new Error('Unexpected paragraph format');
        }

        const translatedText = paragraphs
            .map(item => (Array.isArray(item) && item[0]) ? item[0] : '')
            .join('');

        return NextResponse.json({ translatedText });

    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json({ error: 'Failed to translate', details: error.message }, { status: 500 });
    }
}
