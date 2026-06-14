"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X, ZoomIn, ZoomOut, Check } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Point {
  x: number
  y: number
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface AvatarCropperProps {
  imageSrc: string
  onCropComplete: (file: File) => void
  onCancel: () => void
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.src = url
  })
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  const outputSize = Math.max(pixelCrop.width, pixelCrop.height)
  canvas.width = outputSize
  canvas.height = outputSize

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Canvas is empty"))
    }, "image/jpeg", 0.92)
  })
}

export function AvatarCropper({ imageSrc, onCropComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropCompleteCallback = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
      onCropComplete(file)
    } catch (err) {
      console.error("Crop failed:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1d1d1f]/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e8e0cc]">
          <div>
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Adjust your photo</h3>
            <p className="text-sm text-[#8a8a8a]">Drag to move, pinch or scroll to zoom</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-[#f8f1de] flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5c542]/30 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative w-full aspect-square bg-[#1d1d1f]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: { background: "#1d1d1f" },
              cropAreaStyle: {
                border: "3px solid white",
                boxShadow: "0 0 0 9999px rgba(29, 29, 31, 0.6)",
              },
            }}
          />
        </div>

        {/* Zoom controls */}
        <div className="px-6 py-4 border-b border-[#e8e0cc]">
          <div className="flex items-center gap-3">
            <ZoomOut size={18} className="text-[#8a8a8a]" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#f8f1de] rounded-full appearance-none cursor-pointer accent-[#f5c542]"
            />
            <ZoomIn size={18} className="text-[#8a8a8a]" />
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="h-12 rounded-xl border-[#e8e0cc] bg-white hover:bg-[#f8f1de] text-[#1d1d1f] px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !croppedAreaPixels}
            className="h-12 rounded-xl bg-[#1d1d1f] hover:bg-[#1d1d1f]/90 text-white px-6"
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Check size={18} strokeWidth={1.75} className="mr-2" />
                Use photo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
