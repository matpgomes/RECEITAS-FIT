'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Camera, Star, Upload, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRecipe } from '@/hooks/useRecipes'
import { useCheckIns } from '@/hooks/useCheckIns'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.recipeId as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { recipe, loading: recipeLoading } = useRecipe(recipeId)
  const { createCheckIn } = useCheckIns()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Cleanup camera stream on unmount or when camera closes
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const openCamera = async () => {
    setIsCameraOpen(true)
    setIsCameraLoading(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use rear camera on mobile
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsCameraLoading(false)
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Não foi possível acessar a câmera')
      setIsCameraOpen(false)
      setIsCameraLoading(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return

      // Create file from blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })

      setSelectedFile(file)

      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const newPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(newPreviewUrl)

      // Close camera
      closeCamera()

      toast.success('Foto capturada!')
    }, 'image/jpeg', 0.9)
  }

  const closeCamera = () => {
    stopCamera()
    setIsCameraOpen(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setSelectedFile(file)

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Por favor, adicione uma foto da sua receita')
      return
    }

    if (rating === 0) {
      toast.error('Por favor, dê uma avaliação para a receita')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Você precisa estar logado')
        router.push('/login')
        return
      }

      // Upload photo to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${recipeId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('check-in-photos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Erro ao fazer upload da foto: ' + uploadError.message)
        return
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('check-in-photos').getPublicUrl(fileName)

      // Create check-in
      const checkIn = await createCheckIn(
        recipeId,
        publicUrl,
        rating,
        comment.trim() || null
      )

      if (checkIn) {
        // Success! Navigate back to recipe
        router.push(`/recipe/${recipeId}`)
      }
    } catch (error: any) {
      console.error('Check-in error:', error)
      toast.error('Erro ao fazer check-in: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (recipeLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container max-w-2xl mx-auto p-4 text-center">
        <p className="text-muted-foreground">Receita não encontrada</p>
        <Button onClick={() => router.push('/recipes')} className="mt-4">
          Ver Receitas
        </Button>
      </div>
    )
  }

  const maxCommentLength = 300
  const commentLength = comment.length

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Check-in da Receita</h1>
          <p className="text-sm text-muted-foreground">{recipe.title}</p>
        </div>
      </div>

      {/* Recipe Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={recipe.image_url}
                alt={recipe.title}
                fill
                className="object-cover"
                quality={75}
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground">
                {recipe.prep_time_minutes} min • {recipe.calories_fit} cal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto da Receita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-muted">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" quality={75} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={openCamera}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Nova Foto
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCameraClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={openCamera}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Camera className="h-10 w-10" />
                  <div className="text-center px-2">
                    <p className="font-medium text-sm">Tirar Foto</p>
                    <p className="text-xs">Abrir câmera</p>
                  </div>
                </button>
                <button
                  onClick={handleCameraClick}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Upload className="h-10 w-10" />
                  <div className="text-center px-2">
                    <p className="font-medium text-sm">Upload</p>
                    <p className="text-xs">Escolher arquivo</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Máximo 5MB • JPG, PNG ou WEBP
          </p>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={cn(
                  'transition-all duration-200 hover:scale-110',
                  rating >= star ? 'text-yellow-500' : 'text-gray-300'
                )}
              >
                <Star
                  className={cn(
                    'h-10 w-10',
                    rating >= star && 'fill-current'
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              {rating === 5 && 'Perfeito! 🤩'}
              {rating === 4 && 'Muito bom! 😊'}
              {rating === 3 && 'Bom! 🙂'}
              {rating === 2 && 'Ok 😐'}
              {rating === 1 && 'Pode melhorar 😕'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Comentário <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            placeholder="Como foi preparar esta receita? Compartilhe sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {commentLength}/{maxCommentLength}
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="space-y-3 pb-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedFile || rating === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              Publicar Check-in
            </>
          )}
        </Button>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 text-center">
            <strong>+10 pontos</strong> ao publicar seu check-in! 🎉
          </p>
          <p className="text-xs text-green-700 text-center mt-1">
            Sua publicação será analisada antes de aparecer publicamente
          </p>
        </div>
      </div>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[calc(100%-2rem)] p-0">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle>Tirar Foto</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeCamera}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="relative bg-black">
            {isCameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}

            {/* Video Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-square object-cover"
            />

            {/* Hidden canvas for capturing photo */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="p-4">
            <Button
              onClick={capturePhoto}
              disabled={isCameraLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capturar Foto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
