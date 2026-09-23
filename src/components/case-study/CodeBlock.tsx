import styles from './CaseStudy.module.css';

/** Trailing line comments: `// …` or SQL-style `-- …`, preceded by whitespace. */
const COMMENT = /(\s)(\/\/.*|--\s.*)$/;

/** A code excerpt with its comments dimmed. No highlighter dependency needed. */
export function CodeBlock({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <pre className={styles.code} tabIndex={0}>
      <code>
        {lines.map((line, i) => {
          const match = line.match(COMMENT);
          const body = match ? line.slice(0, match.index! + 1) : line;
          return (
            <span key={i}>
              {body}
              {match && <span className={styles.comment}>{match[2]}</span>}
              {i < lines.length - 1 && '\n'}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
