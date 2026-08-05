import { MARK_PATH, MARK_TRANSFORM, MARK_VIEWBOX } from "@/lib/brand";

/**
 * The AB monogram. Inherits `currentColor`, so it takes the paper colour in
 * the header and can be inverted anywhere else without a second asset.
 *
 * Decorative wherever it sits next to the wordmark — the company name is
 * already in the DOM as text, and a second reading of it helps nobody.
 */
export function Mark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={MARK_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g transform={MARK_TRANSFORM} fill="currentColor">
        <path d={MARK_PATH} />
      </g>
    </svg>
  );
}
