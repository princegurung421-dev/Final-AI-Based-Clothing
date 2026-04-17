import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4A7C59",
          color: "white",
          fontSize: 118,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        W
      </div>
    ),
    { ...size }
  )
}
