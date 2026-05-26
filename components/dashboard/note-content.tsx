const tokenPattern = /(@[\w]+|#[\w-]+)/g;

export function NoteContent({ text }: { text: string }) {
  const parts = text.split(tokenPattern);

  return (
    <p className="text-[15px] leading-relaxed text-foreground">
      {parts.map((part, index) =>
        part.startsWith("@") || part.startsWith("#") ? (
          <span key={index} className="font-semibold text-link">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}
