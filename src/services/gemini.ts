import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const analyzeVideo = async (videoTitle: string, description: string) => {
  if (!API_KEY) {
    throw new Error('Gemini API Key is missing.');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    You are an expert educational content analyzer. 
    Analyze the following YouTube video title and description to extract key learning points and a concise summary.
    
    Video Title: ${videoTitle}
    Description: ${description}
    
    Return a JSON object with:
    - summary: A 2-sentence summary.
    - keyPoints: An array of 3-5 key learning points.
    - category: The most relevant educational category.
    
    IMPORTANT: Return ONLY the JSON object, no other text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) return null;
    
    // Clean the text in case Gemini wraps it in markdown code blocks
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error analyzing video with Gemini:', error);
    return null;
  }
};
