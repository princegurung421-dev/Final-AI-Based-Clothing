import { ImageResponse } from "next/og"

export const runtime = "edge"
export const contentType = "image/png"

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
          fontSize: 320,
          fontWeight: 700,
          letterSpacing: -10,
          borderRadius: 96,
        }}
      >
        W
      </div>
    ),
    { width: 512, height: 512 }
  )
}
