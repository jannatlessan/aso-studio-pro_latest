// build: trigger redeploy
import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { screenshots } = request.body;

  if (!screenshots || !Array.isArray(screenshots)) {
    return response.status(400).json({ error: 'Screenshots are required' });
  }

  try {
    const prompt = `
      Act as an ASO (App Store Optimization) Expert and Conversion Copywriter.
      I will provide you with a list of screenshot descriptions (or just the fact that there are ${screenshots.length} screenshots).
      Your task is to generate high-converting HEADLINES and SUBHEADINGS for each screenshot.
      
      Rules:
      - App Store / Play Store style
      - High-conversion marketing tone
      - Simple English (global users)
      - Headlines: max 6-8 words
      - Subheadings: 10-15 words
      - Avoid generic phrases like "Welcome to the app"
      - Each screenshot should have a unique benefit-driven headline.
      - Maintain consistency across all screenshots.
      
      Output format: JSON object with a "headlines" key containing an array of objects with "headline" and "subheadline".
      Example: {"headlines": [{"headline": "Track Your Sleep", "subheadline": "Get deep insights into your nightly rest patterns."}]}
    `;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shaaddev.studio',
        'X-Title': 'ASO Studio Pro',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: 'You are an ASO expert copywriter.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const data = await res.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return response.status(200).json(result);
  } catch (error) {
    console.error('OpenRouter Error:', error);
    return response.status(500).json({ error: 'Failed to generate copy' });
  }
}
