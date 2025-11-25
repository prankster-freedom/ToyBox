import 'dotenv/config';
import { getAllUserIdsActiveToday, getChatHistoryForDay, getRecentAnalyses, getAiPersona, updateAiPersona } from '../lib/store.js';
import { synthesizePersonality } from '../lib/ai.js';
import { log } from '../lib/logger.js';

async function main() {
    log('Dream Job started.');
    try {
        const userIds = await getAllUserIdsActiveToday();
        log(`Found ${userIds.length} users to process.`);

        const today = new Date();

        for (const userId of userIds) {
            log(`Processing user: ${userId}`);
            
            // データ取得
            const history = await getChatHistoryForDay(userId, today);
            const analyses = await getRecentAnalyses(userId, 5);
            const currentPersonaData = await getAiPersona(userId);
            
            if (history.length === 0) {
                log(`No chat history for today for user ${userId}, skipping.`);
                continue;
            }

            // 性格の再統合
            const newPersonality = await synthesizePersonality(
                currentPersonaData.basePersonality,
                history,
                analyses
            );

            // 更新
            await updateAiPersona(userId, { basePersonality: newPersonality });
            
            // 分析履歴にも記録（タイプ: dream）
            // ここでは簡易的にログだけ出しますが、本来はsavePersonalityAnalysisを呼ぶのもありです。
            log(`Updated personality for user ${userId}`);
        }
    } catch (err) {
        console.error('Dream Job failed:', err);
        process.exit(1);
    }
    log('Dream Job finished successfully.');
}

main();
