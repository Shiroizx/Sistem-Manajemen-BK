'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { 
  Button, 
  Card, 
  TextField, 
  Input, 
  Label, 
  Alert,
} from '@heroui/react'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { loginAction } from './actions'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background fade in first
      gsap.from(backgroundRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      })

      // Animate card slide up and fade in
      gsap.from(cardRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      })
    })

    return () => ctx.revert()
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAction(formData)
      
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // If successful, redirect happens in the server action
      // Note: redirect() throws NEXT_REDIRECT which is expected behavior
    } catch (err: unknown) {
      // Check if this is a redirect error (expected behavior)
      // NEXT_REDIRECT errors are thrown by Next.js redirect() function
      const error = err as { digest?: string; message?: string }
      if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
        // This is expected - redirect is happening, don't show error
        return
      }
      
      // Only show error for actual errors
      console.error('Login error:', err)
      setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Background Pattern */}
      <div ref={backgroundRef} className="absolute inset-0">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.3}
          duration={3}
          repeatDelay={1}
          className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        />
      </div>

      {/* Login Card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md px-4">
        <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <Card.Header className="flex flex-col gap-1 pb-6 pt-8 px-8">
            <Card.Title className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              SMAN 101 Jakarta
            </Card.Title>
            <Card.Description className="text-base text-gray-700 dark:text-gray-300 font-normal">
              Sistem Manajemen Bimbingan Konseling
            </Card.Description>
          </Card.Header>

          <Card.Content className="px-8 pb-6">
            <form action={handleSubmit} className="flex flex-col gap-6">
              {/* Error Alert */}
              {error && (
                <Alert status="danger" className="animate-in fade-in slide-in-from-top-2">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title className="text-gray-900 dark:text-white">Error</Alert.Title>
                    <Alert.Description className="text-gray-700 dark:text-gray-300">{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}

              {/* Email Field */}
              <TextField
                name="email"
                type="email"
                isRequired
                isDisabled={isLoading}
                className="w-full [&_label]:text-gray-900 [&_label]:dark:text-white [&_label]:font-medium [&_label[data-required=true]]:after:content-['*'] [&_label[data-required=true]]:after:text-gray-500 [&_label[data-required=true]]:after:ml-1 [&_input]:focus-visible:ring-black [&_input]:focus-visible:border-black [&_input]:dark:focus-visible:ring-white [&_input]:dark:focus-visible:border-white"
              >
                <Label>Email</Label>
                <Input
                  placeholder="nama@sman101jkt.sch.id"
                  autoComplete="email"
                  variant="secondary"
                  className="text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </TextField>

              {/* Password Field */}
              <TextField
                name="password"
                type="password"
                isRequired
                isDisabled={isLoading}
                className="w-full [&_label]:text-gray-900 [&_label]:dark:text-white [&_label]:font-medium [&_label[data-required=true]]:after:content-['*'] [&_label[data-required=true]]:after:text-gray-500 [&_label[data-required=true]]:after:ml-1 [&_input]:focus-visible:ring-black [&_input]:focus-visible:border-black [&_input]:dark:focus-visible:ring-white [&_input]:dark:focus-visible:border-white"
              >
                <Label>Password</Label>
                <Input
                  placeholder="••••••••"
                  autoComplete="current-password"
                  variant="secondary"
                  className="text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </TextField>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                isPending={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </Card.Content>

          <Card.Footer className="px-8 pb-8">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400 w-full">
              SMAN 101 Jakarta - Sistem Manajemen Bimbingan Konseling
            </p>
          </Card.Footer>
        </Card>
      </div>
    </div>
  )
}
