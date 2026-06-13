import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Full Jog Quitter — Plan Your Escape from the 9-to-5"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f5f5f7",
          padding: "80px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "#0066cc",
              color: "white",
              fontSize: "32px",
            }}
          >
            🏖️
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(0, 102, 204, 0.1)",
              color: "#0066cc",
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            Your tool to escape
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#1d1d1f",
              maxWidth: "600px",
            }}
          >
            Full Jog Quitter — Plan Your Escape from the 9-to-5
          </div>

          <div
            style={{
              fontSize: "28px",
              color: "#6e6e73",
              maxWidth: "560px",
              lineHeight: 1.4,
            }}
          >
            Track savings, calculate your financial runway, and execute your exit strategy with confidence.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
              padding: "18px 36px",
              borderRadius: "16px",
              background: "#0066cc",
              color: "white",
              fontSize: "24px",
              fontWeight: 600,
              marginTop: "16px",
            }}
          >
            Try it for free
          </div>
        </div>

        <div
          style={{
            width: "420px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "380px",
              height: "470px",
              borderRadius: "40px",
              background: "linear-gradient(135deg, #1d1d1f 0%, #434344 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                border: "16px solid #3a3a3c",
                background: "#1c1c1e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ff9f0a",
                  position: "absolute",
                  top: "24px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#34c759",
                  position: "absolute",
                  right: "24px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#0a84ff",
                  position: "absolute",
                  bottom: "24px",
                }}
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#ff453a",
                  position: "absolute",
                  left: "24px",
                }}
              />
              <div
                style={{
                  color: "white",
                  fontSize: "28px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                }}
              >
                MODE
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
