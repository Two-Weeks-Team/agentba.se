import { BRAND_LOGOS, BRAND_LOGO_SIZE } from "@/lib/brand";

/** The CI kit's complete lockup, including the outlined official wordmark. */
export function Logo({ className, variant = "black" }: { className?: string; variant?: keyof typeof BRAND_LOGOS }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BRAND_LOGOS[variant]} width={BRAND_LOGO_SIZE.width} height={BRAND_LOGO_SIZE.height} alt="AgentBase" className={className} />
  );
}
