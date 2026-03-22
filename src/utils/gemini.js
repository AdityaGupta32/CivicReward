import { GoogleGenerativeAI } from '@google/generative-ai';

// Convert file to base64
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const verifyCivicIssue = async (file) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash as the fast multimodal model
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const prompt = `You are an AI assistant for a civic reporting app. The user has uploaded an image of a civic issue (like illegal dumping, broken infrastructure, uncollected garbage, potholes, neglected parks, etc.).
Verify if the image legitimately shows a civic issue. 
Respond ONLY in JSON format matching this schema:
{
  "verified": boolean,
  "reason": "brief explanation",
  "points": number (10, 20, 30, 40, or 50 based on severity, 0 if not verified)
}`;

  const imagePart = await fileToGenerativePart(file);

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", text)
    throw new Error("Failed to parse AI response");
  }
};
