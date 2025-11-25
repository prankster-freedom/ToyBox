import { Datastore } from '@google-cloud/datastore';
import { enter, exit, log } from './logger.js';

const datastore = new Datastore();

const KIND_USER = 'User';
const KIND_AI_PERSONA = 'AiPersona';
const KIND_CHAT_MESSAGE = 'ChatMessage';
const KIND_PERSONALITY_ANALYSIS = 'PersonalityAnalysis';

// --- Users ---

export async function saveUser(user) {
  const functionName = 'saveUser';
  enter(functionName, { userId: user.id });
  const key = datastore.key([KIND_USER, user.id]);
  const entity = {
    key: key,
    data: {
      email: user.emails && user.emails[0] ? user.emails[0].value : null,
      displayName: user.displayName,
      photo: user.photos && user.photos[0] ? user.photos[0].value : null,
      updatedAt: new Date(),
    },
  };
  await datastore.save(entity);
  exit(functionName);
}

// --- AiPersonas ---

export async function getAiPersona(userId) {
  const functionName = 'getAiPersona';
  enter(functionName, { userId });
  const key = datastore.key([KIND_AI_PERSONA, userId]);
  const [entity] = await datastore.get(key);
  exit(functionName, entity);
  return entity || { basePersonality: 'あなたは親切なAIアシスタントです。', interactionCount: 0 };
}

export async function updateAiPersona(userId, data) {
  const functionName = 'updateAiPersona';
  enter(functionName, { userId, data });
  const key = datastore.key([KIND_AI_PERSONA, userId]);
  const [existing] = await datastore.get(key);

  const entity = {
    key: key,
    data: {
      ...existing,
      ...data,
      updatedAt: new Date(),
    },
  };
  await datastore.save(entity);
  exit(functionName);
}

export async function incrementInteractionCount(userId) {
  const functionName = 'incrementInteractionCount';
  enter(functionName, { userId });
  const key = datastore.key([KIND_AI_PERSONA, userId]);
  
  const transaction = datastore.transaction();
  try {
    await transaction.run();
    const [persona] = await transaction.get(key);
    const currentCount = persona ? (persona.interactionCount || 0) : 0;
    const newCount = currentCount + 1;
    
    const entity = {
      key: key,
      data: {
        ...(persona || { basePersonality: 'あなたは親切なAIアシスタントです。' }),
        interactionCount: newCount,
        updatedAt: new Date(),
      },
    };
    
    transaction.save(entity);
    await transaction.commit();
    exit(functionName, { newCount });
    return newCount;
  } catch (err) {
    await transaction.rollback();
    log('ERROR', functionName, err);
    throw err;
  }
}

// --- Chat Messages ---

export async function saveChatMessage(userId, role, content) {
  const functionName = 'saveChatMessage';
  enter(functionName, { userId, role });
  const key = datastore.key([KIND_CHAT_MESSAGE]);
  const entity = {
    key: key,
    data: {
      user_uid: userId,
      role: role,
      content: content,
      timestamp: new Date(),
    },
  };
  await datastore.save(entity);
  exit(functionName);
}

export async function getRecentChatHistory(userId, limit = 10) {
  const functionName = 'getRecentChatHistory';
  enter(functionName, { userId, limit });
  const query = datastore.createQuery(KIND_CHAT_MESSAGE)
    .filter('user_uid', '=', userId)
    .order('timestamp', { descending: true })
    .limit(limit);
  
  const [messages] = await datastore.runQuery(query);
  // 昇順（古い順）に戻す
  const sorted = messages.reverse();
  exit(functionName, { count: sorted.length });
  return sorted;
}

export async function getChatHistoryForDay(userId, date) {
    const functionName = 'getChatHistoryForDay';
    enter(functionName, { userId, date });
    
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const query = datastore.createQuery(KIND_CHAT_MESSAGE)
      .filter('user_uid', '=', userId)
      .filter('timestamp', '>=', start)
      .filter('timestamp', '<=', end)
      .order('timestamp', { descending: false });

    const [messages] = await datastore.runQuery(query);
    exit(functionName, { count: messages.length });
    return messages;
}


// --- Personality Analysis (Daydream/Dream) ---

export async function savePersonalityAnalysis(userId, traits, type) {
  const functionName = 'savePersonalityAnalysis';
  enter(functionName, { userId, type });
  const key = datastore.key([KIND_PERSONALITY_ANALYSIS]);
  const entity = {
    key: key,
    data: {
      user_uid: userId,
      traits: traits,
      type: type,
      timestamp: new Date(),
    },
  };
  await datastore.save(entity);
  exit(functionName);
}

export async function getRecentAnalyses(userId, limit = 5) {
    const functionName = 'getRecentAnalyses';
    enter(functionName, { userId });
    const query = datastore.createQuery(KIND_PERSONALITY_ANALYSIS)
        .filter('user_uid', '=', userId)
        .order('timestamp', { descending: true })
        .limit(limit);
    const [analyses] = await datastore.runQuery(query);
    exit(functionName, { count: analyses.length });
    return analyses;
}

// --- Delete All Data ---

export async function deleteUserData(userId) {
  const functionName = 'deleteUserData';
  enter(functionName, { userId });

  // User
  await datastore.delete(datastore.key([KIND_USER, userId]));

  // AiPersona
  await datastore.delete(datastore.key([KIND_AI_PERSONA, userId]));

  // ChatMessages
  const msgQuery = datastore.createQuery(KIND_CHAT_MESSAGE).filter('user_uid', '=', userId).select('__key__');
  const [msgs] = await datastore.runQuery(msgQuery);
  if (msgs.length > 0) await datastore.delete(msgs.map(e => e[datastore.KEY]));

  // PersonalityAnalyses
  const analysisQuery = datastore.createQuery(KIND_PERSONALITY_ANALYSIS).filter('user_uid', '=', userId).select('__key__');
  const [analyses] = await datastore.runQuery(analysisQuery);
  if (analyses.length > 0) await datastore.delete(analyses.map(e => e[datastore.KEY]));

  exit(functionName);
}

// --- Utility for Dream Job ---
export async function getAllUserIdsActiveToday() {
    // 簡易実装: 全ユーザーをスキャンする代わりに、今日更新があったAiPersonaを探すなどが効率的だが
    // ここではデモ用に全ユーザーを取得する実装とする（本番ではスケーラビリティに注意）
    const query = datastore.createQuery(KIND_USER).select('__key__');
    const [keys] = await datastore.runQuery(query);
    return keys.map(k => k[datastore.KEY].name);
}

