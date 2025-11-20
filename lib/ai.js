import { GoogleGenAI } from '@google/genai';
import { log, enter, exit } from './logger.js';

const functionName = 'lib/ai';

console.log('entering ai.js');
// 環境変数からAPIキーを取得
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// if (!GEMINI_API_KEY) {
//   log('ERROR:', functionName, 'GEMINI_API_KEY environment variable not set.');
//   throw new Error('GEMINI_API_KEY environment variable not set.');
// }
// console.log(GEMINI_API_KEY);

const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});

/**
 * Generates a chat reply using the Google Generative AI.
 * @param {string} prompt The user's message.
 * @returns {Promise<string>} The AI's reply.
 */
export async function generateChatReply(prompt) {
  const functionName = 'generateChatReply';
  enter(functionName, { prompt });

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    console.log(response.text);
    const text = response.text;
    exit(functionName, { text });
    return text;
  } catch (e) {
    console.log('ERROR:', functionName, e);
    // 外部APIのエラーをアプリケーション内部のエラーとして再スロー
    throw new Error('Failed to generate content from AI model.');
  }
}