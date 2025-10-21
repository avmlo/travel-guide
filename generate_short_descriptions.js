import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  'https://avdnefdfwvpjkuanhdwk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZG5lZmRmd3Zwamt1YW5oZHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTg4MzMsImV4cCI6MjA2OTI5NDgzM30.imGFTDynzDG5bK0w_j5pgwMPBeT9rkXm8ZQ18W6A-nw'
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateShortDescription(name, city, category) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const prompt = `Generate a short, punchy 5-word tagline for this destination:
Name: ${name}
City: ${city}
Category: ${category}

Requirements:
- Exactly 5 words
- Editorial, story-driven tone
- Engaging and memorable
- No punctuation at the end
- Examples: "Refined Japanese dining meets tradition", "Cozy cafe with artisan pastries", "Modern hotel overlooking the harbor"

Tagline:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text().trim();
}

async function updateDescriptions() {
  // Fetch all destinations
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('id, name, city, category, description')
    .order('id');

  if (error) {
    console.error('Error fetching destinations:', error);
    return;
  }

  console.log(`Updating ${destinations.length} destinations...`);

  for (let i = 0; i < destinations.length; i++) {
    const dest = destinations[i];
    
    try {
      const shortDesc = await generateShortDescription(dest.name, dest.city, dest.category);
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('destinations')
        .update({ description: shortDesc })
        .eq('id', dest.id);

      if (updateError) {
        console.error(`Error updating ${dest.name}:`, updateError);
      } else {
        console.log(`${i + 1}/${destinations.length} - ${dest.name}: "${shortDesc}"`);
      }

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error generating for ${dest.name}:`, error);
    }
  }

  console.log('Done!');
}

updateDescriptions();
