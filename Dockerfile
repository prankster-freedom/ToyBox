# Node.jsの公式イメージをベースとして使用します。
# 'slim'版は、本番環境に不要なパッケージを削減した軽量なイメージです。
FROM node:18-slim

# Set production environment by default
ENV NODE_ENV=production

# アプリケーションのコードを配置するディレクトリを作成し、ワーキングディレクトリとして設定します。
WORKDIR /usr/src/app

# 依存関係の解決を効率化するため、まずpackage.jsonとpackage-lock.jsonをコピーします。
COPY package*.json ./

# 本番環境で必要な依存関係のみをインストールします。
RUN npm install --only=production

# アプリケーションのソースコードをコンテナ内にコピーします。
COPY . .

# dataディレクトリの所有者をnodeユーザーに変更します。
RUN chown -R node:node /usr/src/app/data

# セキュリティ向上のため、非rootユーザーであるnodeユーザーに切り替えます。
USER node

# Cloud Runが提供するPORT環境変数をコンテナに公開します。
# デフォルトは8080ですが、環境変数から動的に取得するのがベストプラクティスです。
EXPOSE 8080

# コンテナ起動時に実行するコマンドを指定します。
# npmを介さず直接nodeを実行することで、シグナルハンドリングを改善します。
CMD [ "node", "index.js" ]