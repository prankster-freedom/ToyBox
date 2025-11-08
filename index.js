const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config(); // dotenvを読み込み、環境変数をロード

const app = express();
const port = process.env.PORT || 3000;

// セッションミドルウェアの設定
app.use(session({
  secret: process.env.SESSION_SECRET, // 環境変数からシークレットキーを取得
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passportの初期化
app.use(passport.initialize());
app.use(passport.session());

// PassportのGoogle OAuth 2.0戦略を設定
console.log(`[DEBUG] BASE_URL from env: ${process.env.BASE_URL}`);
const baseURL = process.env.BASE_URL || `http://localhost:${port}`;
const callbackURL = `${baseURL}/auth/google/callback`;
console.log(`[DEBUG] Generated callbackURL: ${callbackURL}`);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // 環境変数からクライアントIDを取得
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 環境変数からクライアントシークレットを取得
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

// ユーザーオブジェクトをセッションに保存
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

// セッションからユーザーオブジェクトを復元
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// 認証ルート
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // 認証成功後、ホームページにリダイレクト
    res.redirect('/');
  });

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// 認証済みユーザーのみアクセスを許可するミドルウェア
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google'); // 未認証の場合はGoogleログインページへリダイレクト
}

// リクエストボディのJSONを解析するためのミドルウェア
app.use(express.json());

// 認証済みユーザーのみが静的ファイルにアクセスできるようにする
app.use(isAuthenticated);

// 'public' ディレクトリ内の静的ファイル（HTML, CSS, JS）を配信するミドルウェア
// この一行により、ルートURL ('/') へのアクセスで public/index.html が自動的に返されます。
app.use(express.static('public'));

// APIルーターを '/api' パスにマウント
const apiRouter = require('./routes/api.js');
app.use('/api', apiRouter);

// 認証済みユーザー情報を返すエンドポイント
app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});


app.listen(port, () => {
  // 起動時のログメッセージを、ローカル開発とクラウド環境の両方で分かりやすいように修正します。
  console.log(`ToyBox server listening on port ${port}`);
});