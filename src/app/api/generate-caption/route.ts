import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages';

export async function POST(req: NextRequest) {
  try {
    // Instantiate here - only runs when route is hit
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Explicit check (good practice)
    if (!openai.apiKey) {
      throw new Error('Missing OPENAI_API_KEY - check .env.local or Vercel env vars');
    }
    if (!anthropic.apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY - check .env.local or Vercel env vars');
    }

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Your vision analysis (GPT-4o)
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this artwork in vivid detail: style, subjects, colors, mood, composition, artistic influences. Be specific and creative.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const imageDesc = visionResponse.choices?.[0]?.message?.content || 'No description generated.';

    // Your Claude prompt & call
    const prompt = `You are an expert social media caption writer for visual artists. 
Based on this detailed description of the artwork: "${imageDesc}"

Generate ONE engaging, ready-to-post Instagram caption. 
Make it poetic, promotional, and artist-voiced. Include relevant emojis, 8-12 targeted hashtags at the end. Keep under 300 characters. End with a call-to-action like "What do you think?" or "Save for inspo!"`;

  // Claude call
const claudeResponse = await anthropic.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 300,
  messages: [{ role: 'user', content: prompt }],
});

const textBlocks = claudeResponse.content.filter(
  (block): block is TextBlock => block.type === 'text'
);

if (textBlocks.length === 0) {
  throw new Error('Claude response contained no text blocks');
}

const caption = textBlocks
  .map((block) => block.text)
  .join('\n')
  .trim();

return NextResponse.json({ caption });
} catch (error: any) {
    console.error('Generation error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to generate caption' },
      { status: 500 }
    );
  }
};