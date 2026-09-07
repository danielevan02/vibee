import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Rendered size in pixels. The asset is square. */
  size?: number;
  /** Set on the logo that is visible during first paint. */
  priority?: boolean;
  className?: string;
}

/**
 * The VIBEE mark.
 *
 * Both files ship and CSS picks one. The alternative - reading the theme in JS
 * behind a hydration guard - was in four components, and each of them showed
 * the light logo for a beat before hydration decided otherwise. This has no
 * such gap, needs no client boundary, and is one definition instead of three
 * (a `dark:invert` hack was the third).
 */
export default function BrandLogo({
  size = 32,
  priority = false,
  className,
}: BrandLogoProps) {
  const shared = cn("object-contain", className);

  return (
    <>
      <Image
        src="/black-logo.png"
        alt="VIBEE"
        width={size}
        height={size}
        priority={priority}
        className={cn(shared, "dark:hidden")}
        style={{ width: size, height: size }}
      />
      <Image
        src="/white-logo.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        priority={priority}
        className={cn(shared, "hidden dark:block")}
        style={{ width: size, height: size }}
      />
    </>
  );
}
