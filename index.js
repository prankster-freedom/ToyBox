const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config(); // dotenvを読み込み、環境変数をロード

const morgan = require('morgan');

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
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

if (process.env.NODE_ENV === 'development') {
  // 開発環境では、すべてのリクエストに対してモックユーザーを認証済みとして扱う
  app.use((req, res, next) => {
    req.user = {
      id: 'dev-user-01',
      displayName: '開発用ユーザー',
      emails: [{ value: 'dev@example.com' }],
      photos: [{ value: 'https://i.pravatar.cc/150?u=dev-user-01' }]
    };
    next();
  });
  console.log('!!! Development Mode: Authentication is being skipped. A mock user is used. !!!');
} else {
  // 本番環境では、PassportのGoogle OAuth 2.0戦略を設定
  if (process.env.NODE_ENV === 'development') {
    console.log('--------------------------------------------------');
    console.log('Google OAuth Strategy Configuration:');
    console.log(`  Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(`  Callback URL: /auth/google/callback`);
    console.log('--------------------------------------------------');
  }
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID, // 環境変数からクライアントIDを取得
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 環境変数からクライアントシークレットを取得
      callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Google profile received:', JSON.stringify(profile, null, 2));
      }
      return cb(null, profile);
    }
  ));

  // ユーザーオブジェクトをセッションに保存
  passport.serializeUser(function(user, cb) {
    if (process.env.NODE_ENV === 'development') {
      console.log('User serialized to session:', user.id);
    }
    cb(null, user);
  });

  // セッションからユーザーオブジェクトを復元
  passport.deserializeUser(function(obj, cb) {
    if (process.env.NODE_ENV === 'development') {
      console.log('User deserialized from session:', obj.id);
    }
    cb(null, obj);
  });

  // 認証ルート
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback', (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Attempting to authenticate with Google...');
      console.log('Query parameters:', req.query);
    }
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Google authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.error('Google authentication failed. No user returned. Info:', info);
        return res.redirect('/?auth_error=true');
      }
      req.logIn(user, function(err) {
        if (err) {
          console.error('Login error after Google authentication:', err);
          return next(err);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('User successfully authenticated and logged in.');
        }
        return res.redirect('/');
      });
    })(req, res, next);
  });
}

app.get('/auth/logout', (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // 開発環境ではセッションをいじらず、単にリダイレクト
    res.redirect('/');
  } else {
    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  }
});

// 認証済みユーザーのみアクセスを許可するミドルウェア
function isAuthenticated(req, res, next) {
  // 開発環境では常に認証済みとする
  if (process.env.NODE_ENV === 'development' || req.isAuthenticated()) {
    return next();
  }
  // 本番環境ではGoogleログインページへリダイレクト
  res.redirect('/auth/google');
}

// リクエストボディのJSONを解析するためのミドルウェア
app.use(express.json());



// 'public' ディレクトリ内の静的ファイル（HTML, CSS, JS）を配信するミドルウェア
// この一行により、ルートURL ('/') へのアクセスで public/index.html が自動的に返されます。
app.use(express.static('public'));

// APIルーターを '/api' パスにマウント
const apiRouter = require('./routes/api.js');
app.use('/api', isAuthenticated, apiRouter);




// 認証済みユーザー情報を返すエンドポイント
app.get('/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    message: message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});


app.listen(port, () => {
  // 起動時のログメッセージを、ローカル開発とクラウド環境の両方で分かりやすいように修正します。
  console.log(`ToyBox server listening on port ${port}`);
});