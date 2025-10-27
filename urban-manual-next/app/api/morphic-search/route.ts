import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response('Invalid query', { status: 400 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Fetch destinations from Supabase
          const { data: destinations, error } = await supabase
            .from('destinations')
            .select('*')
            .limit(50);

          if (error) {
            throw error;
          }

          // Step 2: Use Gemini to analyze query and recommend destinations
          const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

          const prompt = `You are a travel recommendation assistant. A user is asking: "${query}"

Here are the available destinations:
${JSON.stringify(destinations?.slice(0, 20) || [], null, 2)}

Based on this query, provide:
1. A brief, helpful response (2-3 sentences)
2. Recommend 3-5 most relevant destinations from the list above

Format your response naturally, explaining why these destinations match their query.`;

          // Stream the AI response
          const result = await model.generateContentStream(prompt);

          let fullResponse = '';
          let relevantDestinations: any[] = [];

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;

            // Send token to client
            const data = JSON.stringify({ type: 'token', content: chunkText });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Step 3: Extract destination recommendations from AI response
          // Use basic keyword matching to find mentioned destinations
          relevantDestinations = (destinations || [])
            .filter((dest) =>
              fullResponse.toLowerCase().includes(dest.name.toLowerCase()) ||
              fullResponse.toLowerCase().includes(dest.slug.toLowerCase())
            )
            .slice(0, 5)
            .map((dest) => ({
              destination: dest,
              relevance: `Recommended based on your query`,
            }));

          // If no destinations found in response, do semantic search
          if (relevantDestinations.length === 0) {
            const queryLower = query.toLowerCase();
            relevantDestinations = (destinations || [])
              .filter((dest) => {
                const searchText = `${dest.name} ${dest.category} ${dest.city} ${dest.content || ''}`.toLowerCase();
                return searchText.includes(queryLower);
              })
              .slice(0, 5)
              .map((dest) => ({
                destination: dest,
                relevance: `Matches "${query}"`,
              }));
          }

          // Send results
          const resultsData = JSON.stringify({
            type: 'results',
            destinations: relevantDestinations,
          });
          controller.enqueue(encoder.encode(`data: ${resultsData}\n\n`));

          // Send done signal
          const doneData = JSON.stringify({ type: 'done' });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error('Search error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            message: 'Failed to process search',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Morphic search error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
