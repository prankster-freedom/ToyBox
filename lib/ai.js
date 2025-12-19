import { GoogleGenAI } from '@google/genai';
import { log, enter, exit } from './logger.js';

console.log('entering ai.js');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});

/**
 * AI Model Configurations per task type.
 * 1. Gemini 3 Pro (思考): gemini-3-pro-preview / High
 * 2. Gemini 3 Pro (高速): gemini-3-pro-preview / Low
 * 3. Gemini 3 Flash: gemini-3-flash-preview / Medium
 */
export const AI_CONFIGS = {
  chat: {
    model: 'gemini-3-flash-preview',
    thinkingLevel: "Medium", // @param ["Minimal", "Low", "Medium", "High"]
  },
  daydream: {
    model: 'gemini-3-pro-preview',
    thinkingLevel: "Low", // @param ["Low", "High"]
  },
  dream: {
    model: 'gemini-3-pro-preview',
    thinkingLevel: "High", // @param ["Low", "High"]
  },
  flash: {
    model: 'gemini-3-flash-preview',
    thinkingLevel: 'Medium'
  }
};

/**
 * Generates a chat reply considering history and persona.
 * @param {string} prompt The user's message.
 * @param {Array} history Chat history array.
 * @param {string} persona The AI's current personality/persona definition.
 * @param {boolean} isAutoTrigger Whether this is an autonomous trigger.
 * @returns {Promise<string>} The AI's reply.
 */
export async function generateChatReply(prompt, history = [], persona = '', isAutoTrigger = false) {
  const functionName = 'generateChatReply';
  enter(functionName, { prompt, historyLength: history.length, isAutoTrigger });

  try {
    let systemInstruction = `あなたは「成長する私エージェント アイ」です。\n`;
    systemInstruction += `以下の性格設定(Persona)に基づき、ユーザーの親しい友人またはパートナーとして振る舞ってください。\n`;
    systemInstruction += `--- Persona ---\n${persona}\n-------------\n`;
    
    if (isAutoTrigger) {
        systemInstruction += `現在、会話が途切れています。ユーザーの過去の傾向や性格を考慮し、ユーザーが興味を持ちそうな話題、あるいはユーザーの価値観をより深く知るための質問を、自然な形で投げかけてください。唐突すぎないように注意してください。`;
    }

    // 履歴をGeminiの形式に変換
    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    // 新しいユーザーメッセージを追加 (AutoTriggerの場合はプロンプトが空の場合があるため制御)
    if (prompt) {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
    } else if (isAutoTrigger) {
         contents.push({ role: 'user', parts: [{ text: '(会話が途切れています。何か話しかけてください)' }] });
    }

    const config = AI_CONFIGS.chat;
    const response_AI = await genAI.models.generateContent({
      model: config.model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
          thinkingLevel: config.thinkingLevel
        }
      },
    });

    const responseText = response_AI.text;
    exit(functionName, { responseText });
    return responseText;
  } catch (e) {
    console.log('ERROR:', functionName, e);
    throw new Error('Failed to generate content from AI model.');
  }
}

/**
 * Daydream: Analyzes recent interactions to extract personality traits.
 */
export async function analyzePersonality(history) {
    const functionName = 'analyzePersonality';
    enter(functionName, { historyLength: history.length });

    const prompt = `
    以下の会話ログから、ユーザーの性格、興味、価値観、話し方の特徴などを分析し、箇条書きで抽出してください。
    --- 会話ログ ---
    ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
    ----------------
    `;

    try {
        const config = AI_CONFIGS.daydream;
        const response = await genAI.models.generateContent({
            model: config.model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                thinkingConfig: {
                    thinkingLevel: config.thinkingLevel
                }
            }
        });
        const text = response.text;
        exit(functionName, { text });
        return text;
    } catch (e) {
        log('ERROR', functionName, e);
        throw e;
    }
}

/**
 * Dream: Synthesizes daily history and past analyses to update base personality.
 */
export async function synthesizePersonality(currentPersona, dailyHistory, pastAnalyses) {
    const functionName = 'synthesizePersonality';
    enter(functionName);

    const prompt = `
    あなたはユーザーとともに成長するAIです。これまでの性格設定、本日の会話、および過去の分析結果を統合し、
    よりユーザーに寄り添うように、新しい「AIの性格設定（Persona）」を作成してください。
    
    現在の性格設定:
    ${currentPersona}
    
    過去の分析結果:
    ${pastAnalyses.map(a => `- ${a.traits}`).join('\n')}
    
    本日の会話:
    ${dailyHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    出力は、AIのシステムプロンプトとしてそのまま使える形式のテキストのみにしてください。
    `;

    try {
         const config = AI_CONFIGS.dream;
         const response = await genAI.models.generateContent({
            model: config.model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                thinkingConfig: {
                    thinkingLevel: config.thinkingLevel
                }
            }
        });
        const text = response.text;
        exit(functionName, { text });
        return text;
    } catch (e) {
        log('ERROR', functionName, e);
        throw e;
    }
}
