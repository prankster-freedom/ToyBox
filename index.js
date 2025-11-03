const express = require('express');

const app = express();
// Cloud Runが提供するPORT環境変数を参照し、なければ3000をデフォルトとして使用します。
const port = process.env.PORT || 3000;

// リクエストボディのJSONを解析するためのミドルウェア
app.use(express.json());

// 'public' ディレクトリ内の静的ファイル（HTML, CSS, JS）を配信するミドルウェア
// この一行により、ルートURL ('/') へのアクセスで public/index.html が自動的に返されます。
app.use(express.static('public'));

// APIルーターを '/api' パスにマウント
const apiRouter = require('./routes/api.js');
app.use('/api', apiRouter);


app.listen(port, () => {
  // 起動時のログメッセージを、ローカル開発とクラウド環境の両方で分かりやすいように修正します。
  console.log(`ToyBox server listening on port ${port}`);
});