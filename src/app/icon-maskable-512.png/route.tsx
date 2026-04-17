import { ImageResponse } from "next/og"

export const runtime = "edge"
export const contentType = "image/png"

// Maskable icon: the "W" needs to fit inside the inner 80% safe area so OS
// launchers with round/squircle masks don't crop it.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4A7C59",
          color: "white",
          fontSize: 220,
          fontWeight: 700,
          letterSpacing: -8,
        }}
      >
        W
      </div>
    ),
    { width: 512, height: 512 }
  )
}
