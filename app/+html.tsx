import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>牌爛未必輸硬 — 台灣麻將台數學習</title>
        <meta name="description" content="台灣十六張麻將台數學習工具：台數表、算台器、台數測驗。Taiwanese Mahjong scoring trainer with 33 tai rules reference, calculator, and quiz." />

        {/* Open Graph */}
        <meta property="og:title" content="牌爛未必輸硬 — 台灣麻將台數學習" />
        <meta property="og:description" content="台數表 · 算台器 · 台數測驗 — 免費學習台灣麻將計分" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_TW" />

        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #faf6ef;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0f2d1a;
  }
}`;
