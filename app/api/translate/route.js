import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { text, targetLang = 'en', sourceLang = 'id' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Google Translate GTX endpoint (Free, rate-limited, unofficial)
        // For production enterprise use, User should use Google Cloud Translation API with API Key.
        // This is a robust fallback for "free" usage in this context.
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Translation service failed');
        }

        const data = await response.json();

        // GTX returns an nested array. 
        // data[0] contains the translated segments.
        // map over them and join the translated text parts.
        const translatedText = data[0].map(item => item[0]).join('');

        return NextResponse.json({ translatedText });

    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
    }
}
