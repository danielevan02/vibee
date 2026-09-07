import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The browser-tab icon.
 *
 * The old favicon.ico was the *white* logo on a transparent background, so it
 * vanished against a light tab strip. Rather than betting on the tab's colour,
 * the mark now sits on its own opaque chip: the same brand gradient the app
 * uses everywhere, which reads on a white strip and a black one alike.
 *
 * Generated rather than hand-drawn so it stays in step with the logo asset -
 * replace the PNG and this follows.
 */
const logo = readFileSync(join(process.cwd(), "public", "white-logo.png"));
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // The gradient from globals.css, used 25 times across the app.
          background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 50%, #4f46e5 100%)",
          borderRadius: 14,
        }}
      >
        <img src={logoSrc} width={38} height={33} alt="" />
      </div>
    ),
    size,
  );
}
