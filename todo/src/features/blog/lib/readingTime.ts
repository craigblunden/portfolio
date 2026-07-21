const WORDS_PER_MINUTE = 200;

/** Fenced code blocks, with or without a language label. */
const FENCED_CODE_BLOCK = /^```[\s\S]*?^```/gm;

/** Markdown syntax that carries no reading weight. */
const MARKDOWN_PUNCTUATION = /[#*_>`~[\]()\-|]/g;

/**
 * Estimates reading time in whole minutes, rounded up, with a floor of one.
 *
 * Code blocks are excluded: they are scanned rather than read word by word, and
 * counting them badly inflates the estimate on exactly the posts most likely to
 * contain them.
 */
export function getReadingTime(content: string): string {
  const prose = content
    .replace(FENCED_CODE_BLOCK, " ")
    .replace(MARKDOWN_PUNCTUATION, " ");

  const wordCount = prose.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return `${minutes} min read`;
}
