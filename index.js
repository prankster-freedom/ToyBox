const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config(); // dotenvを読み込み、環境変数をロード

const { log, enter, exit } = require('./lib/logger');
const { requestLogger } = require('./middleware/requestLogger');
const { responseLogger } = require('./middleware/responseLogger');
const { isAuthenticated } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

const isDevMode = process.env.NODE_ENV !== 'production';

// Setup request-scoped logging
app.use(requestLogger);
// Inject logs into response
app.use(responseLogger);

// セッションミドルウェアの設定
app.use(session({
  secret: process.env.SESSION_SECRET, // 環境変数からシークレットキーを取得
  resave: false,
  saveUninitialized: false,
  cookie: { secure: !isDevMode ? true : false }
}));

// Passportの初期化
app.use(passport.initialize());
app.use(passport.session());

// PassportのGoogle OAuth 2.0戦略を設定
log(`BASE_URL from env: ${process.env.BASE_URL}`);
const baseURL = process.env.BASE_URL || `http://localhost:${port}`;
const callbackURL = `${baseURL}/auth/google/callback`;
log(`Generated callbackURL: ${callbackURL}`);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // 環境変数からクライアントIDを取得
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 環境変数からクライアントシークレットを取得
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    const functionName = 'GoogleStrategy.verify';
    enter(functionName);
    exit(functionName, profile);
    return cb(null, profile);
  }
));

// ユーザーオブジェクトをセッションに保存
passport.serializeUser(function(user, cb) {
  const functionName = 'passport.serializeUser';
  enter(functionName);
  exit(functionName);
  cb(null, user);
});

// セッションからユーザーオブジェクトを復元
passport.deserializeUser(function(obj, cb) {
  const functionName = 'passport.deserializeUser';
  enter(functionName);
  exit(functionName);
  cb(null, obj);
});

// 認証ルート
app.get('/auth/google', (req, res, next) => {
  const functionName = 'GET /auth/google';
  enter(functionName);
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  exit(functionName);
});

app.get('/auth/google/callback',
  (req, res, next) => {
    const functionName = 'GET /auth/google/callback';
    enter(functionName);
    passport.authenticate('google', { failureRedirect: '/' })(req, res, next);
  },
  function(req, res) {
    const functionName = 'GET /auth/google/callback - success';
    enter(functionName);
    // 認証成功後、ホームページにリダイレクト
    res.redirect('/');
    exit(functionName);
  });

app.get('/auth/logout', (req, res, next) => {
  const functionName = 'GET /auth/logout';
  enter(functionName);
  req.logout((err) => {
    if (err) {
      exit(functionName, { err });
      return next(err);
    }
    res.redirect('/');
    exit(functionName);
  });
});

// リクエストボディのJSONを解析するためのミドルウェア
app.use(express.json());

// 'public' ディレクトリ内の静的ファイル（HTML, CSS, JS）を配信するミドルウェア
// この一行により、ルートURL ('/') へのアクセスで public/index.html が自動的に返されます。
app.use(express.static('public'));

// APIルーターを '/api' パスにマウント
const apiRouter = require('./routes/api.js');
app.use('/api', apiRouter);

// 認証済みユーザー情報を返すエンドポイント
app.get('/user', isAuthenticated, (req, res) => {
  const functionName = 'GET /user';
  enter(functionName);
  res.json(req.user);
  exit(functionName, { user: req.user.displayName });
});


app.listen(port, () => {
  // 起動時のログメッセージを、ローカル開発とクラウド環境の両方で分かりやすいように修正します。
  // Note: This log will not be captured in API responses as it's outside a request context.
  console.log(`ToyBox server listening on port ${port}`);
  console.log(`Development mode is ${isDevMode ? 'enabled' : 'disabled'}.`);
});