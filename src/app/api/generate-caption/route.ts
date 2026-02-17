// app/api/generate-caption/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Platform-specific guidelines
const PLATFORM_SPECS = {
  instagram: {
    maxChars: 2200,
    maxHashtags: 30,
    style: 'Visual storytelling with emojis, engaging hooks, and community-building CTAs',
  },
  tiktok: {
    maxChars: 300,
    maxHashtags: 5,
    style: 'Short, punchy, trend-aware with Gen Z appeal',
  },
  twitter: {
    maxChars: 280,
    maxHashtags: 3,
    style: 'Concise, witty, conversation-starting',
  },
  reddit: {
    maxChars: 40000,
    maxHashtags: 0,
    style: 'Authentic, detailed, community-focused without promotional tone',
  },
  artstation: {
    maxChars: 5000,
    maxHashtags: 10,
    style: 'Professional, technical process details, industry-focused',
  },
  deviantart: {
    maxChars: 5000,
    maxHashtags: 15,
    style: 'Creative community-oriented, inspirational, fellow artist connection',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, platforms = [], formData = {} } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: 'No platforms selected' },
        { status: 400 }
      );
    }

    // Build the prompt
    const platformSpecs = platforms.map((p: string) => {
      const spec = PLATFORM_SPECS[p as keyof typeof PLATFORM_SPECS];
      return `${p.toUpperCase()}: ${spec.style} (max ${spec.maxChars} chars, ${spec.maxHashtags} hashtags)`;
    }).join('\n');

    const prompt = `You are an expert social media caption writer for artists. Generate a compelling caption for this artwork.

ARTWORK DETAILS:
${formData.medium ? `Medium: ${formData.medium}` : ''}
${formData.artStyle ? `Style: ${formData.artStyle}` : ''}
${formData.tone ? `Tone: ${formData.tone}` : ''}
${formData.mood ? `Mood: ${formData.mood}` : ''}
${formData.audience ? `Target Audience: ${formData.audience}` : ''}
${formData.subject ? `Subject: ${formData.subject}` : ''}
${formData.customContext ? `Additional Context: ${formData.customContext}` : ''}

PLATFORMS & GUIDELINES:
${platformSpecs}

CAPTION OPTIONS:
${formData.options?.includeProcess ? '- Include details about the creative process' : ''}
${formData.options?.includeHashtags ? '- Include relevant, trending hashtags' : ''}
${formData.options?.includeCTA ? '- Include a call-to-action' : ''}
${formData.options?.includeEmoji ? '- Use emojis strategically' : ''}
${formData.options?.seoOptimized ? '- Optimize for discoverability and search' : ''}

INSTRUCTIONS:
1. Carefully and thoughtfully analyze the uploaded artwork
2. The generated captions should not contain emoji's of any kind, unless specified.
3. Captions should be intelligent, always.
4. Never mention AI
5. Captions should sound human, without using generic terms or phrases such as Dive In
6. Always be as thoughtful as possible in generating the captions.
7. Be specific about what makes THIS artwork special
8. Avoid generic art buzzwords

Generate the caption now:`;

    // Call Claude API with vision
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the caption from Claude's response
    const caption = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Unable to generate caption';

    return NextResponse.json({
      caption,
      platforms,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    console.error('Caption generation error:', error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Anthropic API key.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate caption' },
      { status: 500 }
    );
  }
}