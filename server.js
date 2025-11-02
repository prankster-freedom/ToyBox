const express = require('express');
const greet = require('./greet.js');

const app = express();
// Cloud Runが提供するPORT環境変数を参照し、なければ3000をデフォルトとして使用します。
const port = process.env.PORT || 3000;

const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Node.js Webサーバー</title>
    <style>
        body {
            font-family: sans-serif;
            text-align: center;
            padding-top: 50px;
            background-color: #e0f7fa;
        }
        h1 {
            color: #00796b;
        }
    </style>
</head>
<body>
    <h1>API通信サンプル</h1>
    <p>名前を入力してボタンを押してください。</p>
    <input type="text" id="nameInput" placeholder="名前">
    <button id="greetButton">挨拶する</button>
    <p id="result"></p>

    <script>
        const nameInput = document.getElementById('nameInput');
        const greetButton = document.getElementById('greetButton');
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
    </script>
</body>
</html>
`;

// リクエストボディのJSONを解析するためのミドルウェア
app.use(express.json());

// ルートURL ('/') へのGETリクエストでHTMLを返す
app.get('/', (req, res) => {
  // ExpressではContent-Typeを自動的に設定してくれることが多いですが、
  // 明示的にcharsetを指定するためにsetHeaderを使います。
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlContent);
});

// APIエンドポイント ('/api/greet') へのPOSTリクエストを処理
app.post('/api/greet', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const message = greet(name);
  res.json({ message: message });
});


app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しました。`);
});
