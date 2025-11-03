const nameInput = document.getElementById('nameInput');
const greetButton = document.getElementById('greetButton');
const healthCheckButton = document.getElementById('healthCheckButton');
const resultParagraph = document.getElementById('result');

greetButton.addEventListener('click', async () => {
    const name = nameInput.value || 'World'; // 入力が空なら'World'を使う
    resultParagraph.textContent = '通信中...';

    try {
        const response = await fetch('/api/greet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name }),
        });

        if (!response.ok) {
            throw new Error('サーバーからの応答が正常ではありません。');
        }

        const data = await response.json();
        resultParagraph.textContent = data.message;
    } catch (error) {
        console.error('エラーが発生しました:', error);
        resultParagraph.textContent = 'エラーが発生しました。';
    }
});

healthCheckButton.addEventListener('click', async () => {
    resultParagraph.textContent = '通信中...';

    try {
        // GETリクエストなので、fetchの第二引数は省略可能です
        const response = await fetch('/api/health');

        if (!response.ok) {
            throw new Error('サーバーからの応答が正常ではありません。');
        }

        const data = await response.json();
        resultParagraph.textContent = `Status: ${data.status}, Timestamp: ${data.timestamp}`;
    } catch (error) {
        console.error('エラーが発生しました:', error);
        resultParagraph.textContent = 'エラーが発生しました。';
    }
});