import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        text({ children }) {
          return (
            <>
              {String(children)
                .split("\n")
                .flatMap((line, i, arr) => [
                  line,
                  i < arr.length - 1 ? <br key={i} /> : null,
                ])}
            </>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
