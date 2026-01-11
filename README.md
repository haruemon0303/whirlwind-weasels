# 夜想曲 - Sound Novel Web App

スマホ対応のサウンドノベル（ADV）Webアプリケーションです。文章中心で進行し、選択肢で分岐するビジュアルノベル形式のゲームです。

## 🎮 デモ

GitHub Pagesで公開予定

## ✨ 機能

### MVP機能（実装済み）
- ✅ **進行システム**: タップで次のテキストへ進む
- ✅ **タイプライター表示**: 文字が一文字ずつ表示される演出
- ✅ **選択肢分岐**: プレイヤーの選択によってストーリーが分岐
- ✅ **BGM/効果音**: Web Audio APIで生成した音声演出
- ✅ **セーブ/ロード**: localStorageを使用した1スロットセーブ
- ✅ **音量調整**: BGMとSEの個別音量調整

### 拡張機能（実装済み）
- ✅ **バックログ**: 過去のテキストを確認できる
- ✅ **オートモード**: 自動でテキストが進行
- ✅ **スキップモード**: 既読部分を高速スキップ
- ✅ **視覚効果**: フラッシュ、画面揺れ、ノイズエフェクト

## 📱 対応デバイス

- **スマートフォン**: iOS Safari, Android Chrome（最優先）
- **タブレット**: iPad, Android タブレット
- **デスクトップ**: Chrome, Firefox, Safari, Edge

### iPhoneでの音声再生について

iOSのセキュリティ制限により、最初のタップまで音声は再生されません。アプリ起動時に表示される「START」ボタンをタップすることで音声が有効化されます。

## 🚀 GitHub Pagesでの公開方法

### 1. リポジトリの設定

1. GitHubでリポジトリを開く
2. **Settings** タブをクリック
3. 左サイドバーの **Pages** をクリック
4. **Source** セクションで以下を設定:
   - Branch: `main` (または `master`)
   - Folder: `/ (root)`
5. **Save** ボタンをクリック

### 2. 公開URLの確認

数分後、ページ上部に以下のようなメッセージが表示されます:

```
Your site is published at https://[username].github.io/[repository-name]/
```

このURLでアプリにアクセスできます。

### 3. カスタムドメインの設定（オプション）

独自ドメインを使用する場合:

1. **Custom domain** フィールドにドメインを入力
2. DNSレコードを設定（詳細はGitHubのドキュメント参照）
3. **Enforce HTTPS** にチェックを入れる

## 📖 操作方法

### 基本操作

- **画面タップ/クリック**: 次のテキストへ進む
- **タイプ中にタップ**: テキストを即座に全表示
- **選択肢ボタン**: タップして選択肢を選ぶ
- **メニューボタン（≡）**: メニューを開く

### メニュー機能

- **セーブ**: 現在の進行状況を保存
- **ロード**: 保存した進行状況から再開
- **タイトルへ**: 最初から始める
- **音量調整**: BGMとSEの音量を個別に調整
- **オート**: ONにすると自動でテキストが進む
- **スキップ**: ONにすると既読部分を高速スキップ
- **バックログ**: 過去のテキスト履歴を表示

## 🛠️ 技術スタック

- **HTML5**: セマンティックマークアップ
- **CSS3**: レスポンシブデザイン、アニメーション
- **Vanilla JavaScript**: 外部ライブラリ不使用
- **Web Audio API**: 音声生成と再生
- **localStorage**: データ永続化

## 📁 ファイル構成

```
.
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── script.js           # ゲームロジック
├── story.json          # ストーリーデータ
├── assets/             # 素材ディレクトリ
│   ├── images/         # 画像ファイル（SVG）
│   │   ├── bg_room.svg
│   │   ├── bg_hallway.svg
│   │   ├── bg_ending.svg
│   │   └── char_silhouette.svg
│   ├── bgm/            # BGMファイル（Web Audio APIで生成）
│   ├── se/             # 効果音ファイル（Web Audio APIで生成）
│   └── AUDIO_README.md # 音声素材の説明
└── README.md           # このファイル
```

## 🎨 ストーリーのカスタマイズ

### story.jsonの編集

`story.json`を編集することで、独自のストーリーを作成できます。

#### 基本構造

```json
{
  "title": "ゲームタイトル",
  "startSceneId": "opening",
  "scenes": {
    "scene_id": {
      "bg": "assets/images/background.svg",
      "bgm": "bgm_id",
      "lines": [...],
      "choices": [...]
    }
  }
}
```

#### ラインの種類

```json
{
  "type": "narration",    // または "dialogue", "system"
  "speaker": "キャラ名",   // dialogue時のみ
  "text": "表示するテキスト",
  "se": "効果音ID",        // オプション
  "effect": "演出名"       // オプション: "flash", "shake", "noise"
}
```

#### 選択肢の設定

```json
{
  "label": "選択肢のテキスト",
  "nextSceneId": "次のシーンID"
}
```

## 🎵 音声のカスタマイズ

### 現在の実装

デフォルトでは、Web Audio APIを使用してブラウザ内で音声を生成しています。これにより著作権の問題を回避しています。

### カスタム音声ファイルの追加

独自の音声ファイルを使用する場合:

1. `assets/bgm/` または `assets/se/` にMP3/OGGファイルを配置
2. `script.js`の音声生成部分を修正（`playBGM()`と`playSE()`メソッド）
3. `story.json`で対応するIDを指定

### 推奨ライセンス

- CC0（パブリックドメイン）
- CC BY（クレジット表記）
- 自作の音声

### 推奨サイト

- [freesound.org](https://freesound.org/) - 効果音
- [incompetech.com](https://incompetech.com/) - BGM（CC BY）

## 🖼️ 画像のカスタマイズ

### SVG画像の編集

`assets/images/`内のSVGファイルは、テキストエディタで直接編集できます。

### 新しい背景の追加

1. SVGまたはPNG/JPG画像を`assets/images/`に追加
2. `story.json`のシーン定義で画像パスを指定:

```json
{
  "bg": "assets/images/new_background.svg"
}
```

## 🔧 開発

### ローカルでの実行

HTTPサーバーを起動する必要があります（`file://`プロトコルではJSONの読み込みが制限されるため）:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

その後、ブラウザで `http://localhost:8000` にアクセス。

### デバッグ

ブラウザの開発者ツール（F12）を使用:

- **Console**: エラーログの確認
- **Network**: リソースの読み込み状況
- **Application > Local Storage**: セーブデータの確認

## 📝 ライセンスと著作権

### コード

このプロジェクトのコード（HTML, CSS, JavaScript）はMITライセンスの下で公開されています。

### 素材

- **画像**: オリジナルのSVG（自由に改変可能）
- **音声**: Web Audio APIで生成（著作権フリー）
- **ストーリー**: サンプルストーリーは自由に改変可能

### 注意事項

- 実在の人物名、企業名、商標は使用しないでください
- 既存作品のキャラクター名、世界観は使用しないでください
- 外部の画像・音声を使用する場合は、ライセンスを確認してください

## 🤝 貢献

バグ報告や機能提案は、GitHubのIssuesでお願いします。

## 📞 サポート

問題が発生した場合:

1. ブラウザのキャッシュをクリア
2. 別のブラウザで試す
3. 開発者ツールのコンソールでエラーを確認
4. GitHubのIssuesで報告

## 🎯 今後の拡張案

- [ ] マルチスロットセーブ（複数セーブデータ）
- [ ] CGギャラリー
- [ ] キャラクター立ち絵の複数パターン
- [ ] ボイス再生機能
- [ ] アチーブメント（実績）システム
- [ ] エンディングリスト
- [ ] クイックセーブ/ロード
- [ ] 設定のエクスポート/インポート

## 📚 参考リンク

- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [localStorage - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Enjoy your sound novel adventure! 🎮✨**
