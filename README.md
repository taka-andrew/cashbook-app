# AI出納予定管理アプリ

仕入先請求書をAIで自動読み取りし、月次出納帳として管理するアプリです。

---

## Vercelへの公開手順（初心者向け）

### ステップ1：このフォルダをGitHubにアップロード

1. [github.com](https://github.com) にログイン
2. 右上の「+」→「New repository」
3. Repository name に `cashbook-app` と入力して「Create repository」
4. 「uploading an existing file」をクリック
5. このフォルダの中身をすべてドラッグ＆ドロップ
6. 「Commit changes」を押す

### ステップ2：Vercelでデプロイ

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New」→「Project」
3. 先ほど作ったGitHubリポジトリを選択
4. Framework Preset が「Next.js」になっていることを確認
5. 「Deploy」ボタンを押す（1〜2分待つ）

### ステップ3：APIキーを設定する（重要）

1. Vercelのプロジェクトページ →「Settings」→「Environment Variables」
2. 以下を入力して「Add」：
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`（Anthropicコンソールで取得したキー）
3. 「Deployments」タブ →「Redeploy」を押す

### ステップ4：URLを社員に共有

発行されたURL（例：`cashbook-app.vercel.app`）をLINEやメールで共有するだけ。
インストール不要で、ブラウザから使えます。

---

## ローカルで動かす場合（開発・確認用）

```bash
# 1. 依存パッケージをインストール
npm install

# 2. APIキーを設定（.env.localファイルを作成）
echo "ANTHROPIC_API_KEY=sk-ant-ここにキー" > .env.local

# 3. 開発サーバーを起動
npm run dev

# 4. ブラウザで http://localhost:3000 を開く
```

---

## 機能一覧

- 仕入先請求書（PDF・画像）をAIで自動読み取り
- 自社請求書から入金予定日を自動計算
- 手入力で支払・入金予定を登録
- 月次出納帳（予定／確定の管理）
- 残高不足アラート
- 取引先マスタ（支払条件・入金条件）
- CSVエクスポート

---

## 注意事項

- APIキーは絶対にGitHubのコードに直接書かないでください
- Vercelの Environment Variables でのみ管理してください
- Anthropicコンソールで月次の利用上限（Budget）を設定することをお勧めします
