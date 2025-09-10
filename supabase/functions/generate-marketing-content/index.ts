import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      productService, 
      keyMessage, 
      targetAudience, 
      contentType, 
      language, 
      tone, 
      festivalContext 
    } = await req.json();

    console.log('Received request:', { productService, contentType, language, tone });

    // Create culturally relevant prompt based on Indian context
    let prompt = `Write a ${contentType.replace('_', ' ')} in ${language} for "${productService}"`;
    
    if (keyMessage) {
      prompt += ` with the key message: "${keyMessage}"`;
    }
    
    if (targetAudience) {
      prompt += ` targeting ${targetAudience}`;
    }
    
    if (festivalContext) {
      prompt += ` for ${festivalContext} festival`;
    }
    
    prompt += `. Make it ${tone}, culturally relevant for Indian customers, and engaging for local businesses. `;
    
    // Add specific guidelines based on content type
    switch (contentType) {
      case 'social_media_post':
        prompt += 'Include relevant hashtags and emojis. Keep it under 280 characters for better engagement.';
        break;
      case 'whatsapp_message':
        prompt += 'Keep it personal and conversational, suitable for WhatsApp Business. Use appropriate emojis.';
        break;
      case 'product_description':
        prompt += 'Highlight key features and benefits. Make it compelling for online listings.';
        break;
      case 'ad_copy':
        prompt += 'Create urgency and highlight the main benefit. Include a clear call-to-action.';
        break;
      case 'email_campaign':
        prompt += 'Include a compelling subject line and clear call-to-action. Make it professional yet warm.';
        break;
    }

    prompt += ` Use proper ${language} script and ensure cultural sensitivity for Indian markets.`;

    console.log('Generated prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert marketing content creator specializing in Indian regional languages and cultural contexts. You understand local business needs, festivals, cultural nuances, and create engaging content that resonates with Indian audiences. Always write in the requested Indian regional language using proper script and cultural references.` 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    const generatedText = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-marketing-content function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate content', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});