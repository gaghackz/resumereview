import React from "react";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split("\n");

  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      elements.push(
        <p
          key={`p-${elements.length}`}
          className="text-base text-gray-800 mb-3"
        >
          {renderInlineMarkdown(paragraphBuffer.join(" "))}
        </p>
      );
      paragraphBuffer = [];
    }
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Handles **bold**
    const parts = text.split(/(\*\*[^\*]+\*\*)/g);
    return parts.map((part, i) => {
      if (/^\*\*[^\*]+\*\*$/.test(part)) {
        return (
          <strong key={i} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "") {
      flushParagraph();
      continue;
    }

    // Emoji-prefixed header (e.g., ## 🟢 Header)
    const headerMatch = line.match(
      /^#{1,3}\s*([\p{Emoji_Presentation}\p{Extended_Pictographic}])\s*(.+)$/u
    );
    if (headerMatch) {
      flushParagraph();
      const emoji = headerMatch[1];
      const title = headerMatch[2];

      elements.push(
        <h2
          key={`h-${elements.length}`}
          className="text-2xl font-bold text-gray-900 mb-6 mt-8 flex items-center"
        >
          <span className="text-3xl mr-3">{emoji}</span>
          {title}
        </h2>
      );
    }

    // Bullet point (e.g., - something here)
    else if (line.startsWith("- ")) {
      flushParagraph();
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="list-disc list-inside text-base text-gray-800 mb-2"
        >
          <li>{renderInlineMarkdown(line.slice(2))}</li>
        </ul>
      );
    }

    // Else just buffer normal lines for paragraphs
    else {
      paragraphBuffer.push(line);
    }
  }

  flushParagraph();

  return <div className="prose max-w-none">{elements}</div>;
};

export default MarkdownRenderer;
