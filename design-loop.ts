/**
 * Multi-Designer AI Loop
 * 複数のデザイナーAIが意見交換してサイトの品質を自律的に向上させる
 *
 * Usage: bun run design-loop.ts [--rounds N]
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROJECT_DIR = path.dirname(import.meta.url.replace("file://", ""));

// --- Designer Personas ---
const DESIGNERS = [
  {
    id: "ux",
    name: "UXデザイナー（Aoi）",
    focus:
      "ユーザー体験・情報設計・コンバージョン。ユーザーが迷わず目的を達成できるか、CTAが明確か、コンテンツの流れが自然かを重視する。",
  },
  {
    id: "visual",
    name: "ビジュアルデザイナー（Hana）",
    focus:
      "タイポグラフィ・余白・カラー・ビジュアル階層。フォントの美しさ、グリッドの整合性、色の調和、全体的な洗練度を重視する。",
  },
  {
    id: "brand",
    name: "ブランドストラテジスト（Ren）",
    focus:
      "ブランド一貫性・メッセージング・ターゲット訴求。グラフィックデザイナーとしての専門性が伝わるか、信頼感・高級感が出ているかを重視する。",
  },
];

// --- Read current site files ---
function readSiteFiles(): { html: string; css: string } {
  const html = fs.readFileSync(path.join(PROJECT_DIR, "index.html"), "utf-8");
  const css = fs.readFileSync(
    path.join(PROJECT_DIR, "css/style.css"),
    "utf-8"
  );
  return { html, css };
}

// --- Write improved files ---
function writeSiteFiles(html: string, css: string) {
  fs.writeFileSync(path.join(PROJECT_DIR, "index.html"), html, "utf-8");
  fs.writeFileSync(path.join(PROJECT_DIR, "css/style.css"), css, "utf-8");
}

// --- Step 1: Each designer reviews the site ---
async function getDesignerCritique(
  designer: (typeof DESIGNERS)[0],
  html: string,
  css: string,
  round: number,
  previousFeedback?: string
): Promise<string> {
  const systemPrompt = `あなたは${designer.name}です。専門領域: ${designer.focus}

グラフィックデザイナー（名刺・ロゴ・チラシ専門）のポートフォリオサイトのHTMLとCSSを批評してください。

## 批評ルール
- 具体的な改善点を3〜5点挙げる
- 各改善点は「何が問題か」「なぜ問題か」「具体的にどう直すか」を明示
- HTML/CSSのコード変更が必要な場合は具体的なコードを示す
- スタイリッシュでミニマルな落ち着いたデザインの方向性は維持する
- 実装可能な改善のみ提案する（外部ライブラリ追加なし）`;

  const userPrompt = `【ラウンド ${round}】

${previousFeedback ? `## 前回の改善内容\n${previousFeedback}\n\n` : ""}## 現在のHTML
\`\`\`html
${html}
\`\`\`

## 現在のCSS
\`\`\`css
${css}
\`\`\`

あなたの視点からサイトを批評し、改善提案を行ってください。`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// --- Step 2: Lead designer synthesizes and implements improvements ---
async function synthesizeAndImplement(
  critiques: { designer: string; critique: string }[],
  html: string,
  css: string,
  round: number
): Promise<{ html: string; css: string; summary: string }> {
  const systemPrompt = `あなたはリードデザイナーです。複数のデザイナーの批評を統合し、最も効果的な改善をHTMLとCSSに実装してください。

## 実装ルール
- 3人の批評から最も重要な改善を選定して実装する
- スタイリッシュ・ミニマル・落ち着いたデザインの方向性を絶対に維持する
- 外部ライブラリや画像ファイルの追加は不要
- 既存のフォント（Cormorant Garamond, Inter, Noto Sans JP）を活用
- レスポンシブ対応を維持する
- 必ず完全なHTMLとCSSを出力する（省略しない）

## 出力フォーマット
以下の形式で出力してください：

SUMMARY:
（実施した改善の箇条書き、3〜5点）

HTML:
\`\`\`html
（完全なHTMLコード）
\`\`\`

CSS:
\`\`\`css
（完全なCSSコード）
\`\`\``;

  const critiqueText = critiques
    .map((c) => `### ${c.designer}の批評\n${c.critique}`)
    .join("\n\n");

  const userPrompt = `【ラウンド ${round} の改善実装】

## デザイナー批評
${critiqueText}

## 現在のHTML
\`\`\`html
${html}
\`\`\`

## 現在のCSS
\`\`\`css
${css}
\`\`\`

上記の批評を統合して改善を実装してください。`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse output
  const summaryMatch = text.match(/SUMMARY:\n([\s\S]*?)(?=HTML:|$)/);
  const htmlMatch = text.match(/```html\n([\s\S]*?)```/);
  const cssMatch = text.match(/```css\n([\s\S]*?)```/);

  const summary = summaryMatch ? summaryMatch[1].trim() : "改善を実施しました";
  const newHtml = htmlMatch ? htmlMatch[1].trim() : html;
  const newCss = cssMatch ? cssMatch[1].trim() : css;

  return { html: newHtml, css: newCss, summary };
}

// --- Main Loop ---
async function runDesignLoop(rounds: number = 3) {
  console.log(`\n🎨 マルチデザイナーAIループ開始（${rounds}ラウンド）\n`);

  let { html, css } = readSiteFiles();
  let previousSummary = "";
  const allSummaries: string[] = [];

  for (let round = 1; round <= rounds; round++) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ラウンド ${round}/${rounds}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // 3 designers critique in parallel
    console.log("💬 デザイナーが批評中...");
    const critiquePromises = DESIGNERS.map((designer) =>
      getDesignerCritique(designer, html, css, round, previousSummary).then(
        (critique) => {
          console.log(`  ✓ ${designer.name} 完了`);
          return { designer: designer.name, critique };
        }
      )
    );

    const critiques = await Promise.all(critiquePromises);

    // Lead designer implements improvements
    console.log("\n🔨 リードデザイナーが改善を実装中...");
    const result = await synthesizeAndImplement(critiques, html, css, round);

    html = result.html;
    css = result.css;
    previousSummary = result.summary;
    allSummaries.push(`【ラウンド${round}】\n${result.summary}`);

    console.log(`\n✅ ラウンド${round}の改善完了:`);
    console.log(result.summary);

    // Save after each round
    writeSiteFiles(html, css);
    console.log(`\n💾 ファイル保存済み`);
  }

  console.log(`\n\n🏁 全ラウンド完了！\n`);
  console.log("=".repeat(40));
  console.log("改善サマリー:");
  console.log(allSummaries.join("\n\n"));
  console.log("=".repeat(40));

  return allSummaries.join("\n\n");
}

// --- CLI Entry Point ---
const args = process.argv.slice(2);
const roundsFlag = args.indexOf("--rounds");
const rounds = roundsFlag !== -1 ? parseInt(args[roundsFlag + 1]) || 3 : 3;

runDesignLoop(rounds).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
