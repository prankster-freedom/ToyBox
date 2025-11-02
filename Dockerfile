# 1. ベースイメージの選択
# LTS (長期サポート) のNode.js 20の軽量版イメージを使用します。
FROM node:20-slim

# 2. 環境変数の設定
# Node.jsが本番環境モードで実行されるように設定します。
ENV NODE_ENV=production

# 3. 作業ディレクトリの作成
# コンテナ内での作業ディレクトリを指定します。
WORKDIR /usr/src/app

# 4. 依存関係のインストール
# package.jsonとpackage-lock.jsonを先にコピーすることで、
# Dockerのレイヤーキャッシュが有効になり、コードの変更だけでは再インストールが走らなくなります。
COPY package*.json ./

# npm ci は package-lock.json に基づいてクリーンインストールを行うため、本番環境のビルドに適しています。
RUN npm ci --only=production

# 5. アプリケーションコードのコピー
COPY . .

# 6. ポートの公開
# アプリケーションがリッスンするポートをコンテナに公開します。
EXPOSE 3000

# 7. アプリケーションの起動コマンド
# コンテナ起動時に実行されるコマンドです。package.jsonの "start" スクリプトを実行します。
CMD [ "npm", "start" ]