const nameInput = document.getElementById('nameInput');
const greetButton = document.getElementById('greetButton');
const healthCheckButton = document.getElementById('healthCheckButton');
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
                // ユーザー情報が取得できない場合はログインページへリダイレクト
                window.location.href = '/auth/google';
            }
        } else {
            // 応答がOKでない場合もログインページへリダイレクト
            window.location.href = '/auth/google';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/auth/google';
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