const tokenPattern = /(@[\w]+|#[\w-]+)/g;

export function NoteContent({
  text,
  tone = "ink",
  className = "",
}: {
  text: string;
  tone?: "ink" | "pencil";
  className?: string;
}) {
  const parts = text.split(tokenPattern);

  return (
    <p
      className={`break-words text-[17px] leading-[1.55] [overflow-wrap:anywhere] ${
        tone === "pencil" ? "text-fg" : "text-fg"
      } ${className}`}
    >
      {parts.map((part, index) =>
        part.startsWith("@") ? (
          <span key={index} className="font-mono text-[0.92em] font-medium text-live">
            {part}
          </span>
        ) : part.startsWith("#") ? (
          <span key={index} className="font-mono text-[0.92em] text-fg-2">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}
