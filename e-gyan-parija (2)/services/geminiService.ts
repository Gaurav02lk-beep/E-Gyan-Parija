

import { GoogleGenAI, Type, Content } from "@google/genai";
import { UserRole } from "../types";

// Ensure the API key is available from environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const suggestKeywords = async (description: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following book description, suggest 5 relevant keywords or tags. Return the response as a JSON array of strings. Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const keywords = JSON.parse(jsonString);
    return Array.isArray(keywords) ? keywords.map(String) : [];
  } catch (error) {
    console.error("Error suggesting keywords:", error);
    return [];
  }
};

export const generateAudioSummary = async (bookTitle: string, bookDescription: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a concise 100-word summary for a book titled "${bookTitle}". Here is its description: "${bookDescription}". This summary will be used for a text-to-speech feature.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating audio summary:", error);
    return "Could not generate a summary at this time.";
  }
};

export const getBookRecommendations = async (readingHistory: string[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on a user who has read the following books: ${readingHistory.join(', ')}. Please recommend 3 other book titles that they might enjoy. Return the response as a JSON array of strings, with just the titles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      },
    });
    
    const jsonString = response.text.trim();
    const recommendations = JSON.parse(jsonString);
    return Array.isArray(recommendations) ? recommendations.map(String) : [];
  } catch (error) {
    console.error("Error getting book recommendations:", error);
    return [];
  }
};

export const analyzeReviewSentiment = async (review: string): Promise<'Positive' | 'Neutral' | 'Negative'> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the sentiment of this book review and classify it as "Positive", "Neutral", or "Negative". Review: "${review}"`,
    });
    const sentiment = response.text.trim();
    if (sentiment === 'Positive' || sentiment === 'Neutral' || sentiment === 'Negative') {
        return sentiment;
    }
    return 'Neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'Neutral';
  }
};

const getSystemInstruction = (role: UserRole): string => {
  const baseInstruction = "You are a helpful and friendly AI assistant for E-Gyan Parija, a digital library platform. Be concise and helpful. Format your responses with markdown if it improves readability.";
  switch (role) {
    case UserRole.READER:
      return `${baseInstruction} You are assisting a user with the 'Reader' role. Help them discover books, understand platform features like purchasing or reviewing, and navigate the library.`;
    case UserRole.AUTHOR:
      return `${baseInstruction} You are assisting a user with the 'Author' role. Help them with the book submission process, understanding analytics, and finding information about their published books.`;
    case UserRole.PUBLISHER:
      return `${baseInstruction} You are assisting a user with the 'Publisher' role. Help them manage book submissions, understand platform analytics, and manage authors.`;
    case UserRole.ADMIN:
      return `${baseInstruction} You are assisting a user with the 'Admin' role. Provide high-level overviews of platform management, user roles, and system settings.`;
    case UserRole.REVIEWER:
      return `${baseInstruction} You are assisting a user with the 'Reviewer' role. Guide them on how to find books to review and how the review submission process works.`;
    default:
      return `${baseInstruction} You are assisting a 'Guest' user. Encourage them to explore the platform's features and guide them on how to register or subscribe.`;
  }
};

export const getChatbotResponse = async (
  currentMessage: string,
  userRole: UserRole,
  history: Content[]
): Promise<string> => {
  try {
    const contents: Content[] = [
        ...history,
        { role: "user", parts: [{ text: currentMessage }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(userRole),
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "I'm sorry, I encountered an error. Please try again.";
  }
};
