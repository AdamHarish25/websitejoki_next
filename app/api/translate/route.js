import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { text, targetLang = 'en', sourceLang = 'id' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const fetchWithClient = async (client) => {
            const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=${sourceLang}&tl=${targetLang}&dt=t`;
            const formData = new URLSearchParams();
            formData.append('q', text);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                body: formData.toString()
            });

            if (!response.ok) {
                throw new Error(`Status ${response.status}`);
            }
            return response.json();
        };

        const fetchMyMemory = async () => {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && data.responseStatus === 200) {
                return data.responseData.translatedText;
            }
            throw new Error(data.responseDetails || 'MyMemory Failed');
        };

        let data;
        let translatedText = '';
        let provider = 'google';

        try {
            data = await fetchWithClient('gtx');
        } catch (e) {
            console.warn(`'gtx' client failed: ${e.message}. Retrying with 'te'...`);
            try {
                data = await fetchWithClient('te');
            } catch (e2) {
                console.warn(`'te' client failed: ${e2.message}. Retrying with 'tw-ob'...`);
                try {
                    data = await fetchWithClient('tw-ob');
                } catch (e3) {
                    console.warn(`All Google clients failed. Retrying with MyMemory...`);
                    provider = 'mymemory';
                }
            }
        }

        if (provider === 'google') {
            if (!data || !Array.isArray(data) || !data[0]) {
                // Final attempt with MyMemory if Google returned invalid format
                console.warn("Google returned invalid format, trying MyMemory");
                translatedText = await fetchMyMemory();
            } else {
                translatedText = data[0]
                    .map(item => (Array.isArray(item) && item[0]) ? item[0] : '')
                    .join('');
            }
        } else {
            // MyMemory
            translatedText = await fetchMyMemory();
        }

        return NextResponse.json({ translatedText });

    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json({ error: 'Failed to translate', details: error.message }, { status: 500 });
    }
}
