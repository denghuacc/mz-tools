import type { ContentSource } from "../data/content";

const ContentSourceLink = ({ source }: { source: ContentSource }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noreferrer"
    className="text-sm font-medium text-blue-600 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    官网来源 · {source.publishedAt}
    <span className="sr-only">：{source.title}（在新窗口打开）</span>
  </a>
);

export default ContentSourceLink;
