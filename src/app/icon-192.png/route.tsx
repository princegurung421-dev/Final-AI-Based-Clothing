import { ImageResponse } from "next/og"

export const runtime = "edge"
export const contentType = "image/png"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4A7C59",
          color: "white",
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: -4,
          borderRadius: 36,
        }}
      >
        W
      </div>
    ),
    { width: 192, height: 192 }
  )
}
