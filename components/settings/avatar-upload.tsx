"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, X, Upload, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AvatarUploadProps {
  currentAvatar: string
  onAvatarChange: (url: string) => void
  userId: string
  previewClassName?: string
  compact?: boolean
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  userId,
  previewClassName = "bg-[#f8f1de]",
  compact = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function isEmoji(avatar: string) {
    return avatar && avatar.length <= 4 && /\p{Emoji}/u.test(avatar)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.")
      return
    }

    setError(null)
    setIsUploading(true)

    // Show local preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      const supabase = createClient()
      const filePath = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl

      onAvatarChange(publicUrl)
      setPreviewUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  async function handleRemovePhoto() {
    if (isEmoji(currentAvatar)) {
      onAvatarChange("")
      return
    }

    setIsUploading(true)
    try {
      const supabase = createClient()
      const url = new URL(currentAvatar)
      const pathParts = url.pathname.split("/")
      const filePath = pathParts.slice(pathParts.indexOf("avatars") + 1).join("/")

      if (filePath) {
        await supabase.storage.from("avatars").remove([filePath])
      }

      onAvatarChange("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar")
    } finally {
      setIsUploading(false)
    }
  }

  const displayAvatar = previewUrl || currentAvatar

  if (compact) {
    return (
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-9 h-9 rounded-full bg-white text-[#1d1d1f] shadow-md flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-70"
          title="Upload photo"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={16} strokeWidth={1.75} />
          ) : (
            <Camera size={16} strokeWidth={1.75} />
          )}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[#ff3b30] text-center"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-[1.02] disabled:opacity-70 ${previewClassName}`}
        >
          {displayAvatar ? (
            isEmoji(displayAvatar) ? (
              <span className="text-5xl">{displayAvatar}</span>
            ) : (
              <div
                style={{ backgroundImage: `url(${displayAvatar})` }}
                className="w-full h-full bg-cover bg-center"
                aria-label="Avatar"
              />
            )
          ) : (
            <span className="text-4xl font-semibold text-[#1d1d1f]">?</span>
          )}
        </button>

        <AnimatePresence>
          {(currentAvatar && !isEmoji(currentAvatar)) || previewUrl ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#ff3b30] text-white flex items-center justify-center shadow-md hover:bg-[#ff3b30]/90 disabled:opacity-50"
            >
              <X size={14} strokeWidth={2} />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-xl border-[#e8e0cc] bg-white hover:bg-[#f8f1de] text-[#1d1d1f]"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={18} strokeWidth={1.75} />
          ) : (
            <>
              <Upload size={18} strokeWidth={1.75} className="mr-2" />
              Upload photo
            </>
          )}
        </Button>
        <p className="text-xs text-[#8a8a8a]">JPG, PNG or GIF up to 5MB</p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[#ff3b30]"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
