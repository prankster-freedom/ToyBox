const nameInput = document.getElementById('nameInput');
const greetButton = document.getElementById('greetButton');
const healthCheckButton = document.getElementById('healthCheckButton');
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const chatButton = document.getElementById('chatButton');
const resultParagraph = document.getElementById('result');

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const userNameSpan = document.getElementById('userName');

// ページロード時に認証状態をチェック
// サーバーサイドで認証済みの場合のみこのページに到達するため、常にapp-sectionを表示
window.onload = async () => {
    try {
        const response = await fetch('/user'); // ユーザー情報を取得する新しいエンドポイントを想定
        if (response.ok) {
            const user = await response.json();
            if (user && user.displayName) {
                userNameSpan.textContent = user.displayName;
                authSection.style.display = 'none';
                appSection.style.display = 'block';
            } else {
                // ユーザー情報が取得できない場合は、ログインボタンを表示（何もしない）
                console.log('User not logged in');
            }
        } else {
            // 応答がOKでない場合も、ログインボタンを表示（何もしない）
            console.log('Failed to fetch user info');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // エラー時もログインボタンを表示（何もしない）
    }
};

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

chatButton.addEventListener('click', async () => {
    const message = chatInput.value;
    if (!message) return;

    appendMessage('You', message);
    chatInput.value = '';
    resultParagraph.textContent = 'AIが応答を生成中...';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error('サーバーからの応答が正常ではありません。');
        }

        const data = await response.json();
        appendMessage('AI', data.message);
        resultParagraph.textContent = ''; // 応答が成功したらクリア
    } catch (error) {
        console.error('チャットエラー:', error);
        appendMessage('System', 'エラーが発生しました。');
        resultParagraph.textContent = 'エラーが発生しました。';
    }
});

function appendMessage(sender, message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `[${sender}]: ${message}`;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight; // 自動スクロール
}

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