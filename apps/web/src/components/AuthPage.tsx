import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type AuthMode = 'signin' | 'signup'

const labels: Record<
  AuthMode,
  { title: string; description: string; action: string; switchLabel: string; helper: string }
> = {
  signin: {
    title: 'Welcome back',
    description: 'Access your trading journal with your account credentials.',
    action: 'Sign in',
    switchLabel: "Don't have an account? Sign up",
    helper: 'Enter the email and password you used when registering.',
  },
  signup: {
    title: "Let's get started",
    description: 'Create a trading journal account using your email address.',
    action: 'Create account',
    switchLabel: 'Already have an account? Sign in',
    helper: 'Use a valid email address to receive confirmation instructions.',
  },
}

const authSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type AuthFormValues = z.infer<typeof authSchema>

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [message, setMessage] = useState<string | null>(null)

  const copy = labels[mode]
  const canAuth = Boolean(supabase)

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!canAuth) {
      setError('root', {
        type: 'manual',
        message: 'Supabase credentials are missing. Configure your environment first.',
      })
    } else {
      clearErrors('root')
    }
  }, [canAuth, clearErrors, setError])

  const resetFeedback = (options?: { preserveFieldErrors?: boolean }) => {
    const preserveFieldErrors = options?.preserveFieldErrors ?? false

    if (canAuth) {
      if (preserveFieldErrors) {
        clearErrors('root')
      } else {
        clearErrors()
      }
    } else if (!preserveFieldErrors) {
      clearErrors('email')
      clearErrors('password')
    }

    setMessage(null)
  }

  const emailField = register('email')
  const passwordField = register('password')

  const onSubmit = handleSubmit(async ({ email, password }) => {
    resetFeedback()

    if (!canAuth || !supabase) {
      setError('root', {
        type: 'manual',
        message: 'Supabase credentials are missing. Configure your environment first.',
      })
      return
    }

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError('root', { type: 'manual', message: signInError.message })
          return
        }

        setMessage('Signed in successfully. Redirecting…')
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          setError('root', { type: 'manual', message: signUpError.message })
          return
        }

        if (data.user?.email_confirmed_at) {
          setMessage('Account created! You can now sign in.')
        } else {
          setMessage('Check your email to confirm your account before signing in.')
        }

        reset({ email, password: '' })
      }
    } catch {
      setError('root', {
        type: 'manual',
        message: 'Something went wrong. Please try again.',
      })
    }
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md border-border/80 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <span className="mx-auto inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Journal Trading
          </span>
          <div className="space-y-2">
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5 text-left" noValidate>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={!canAuth || isSubmitting}
                placeholder="you@example.com"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive/40' : undefined}
                {...emailField}
                onFocus={() => {
                  resetFeedback({ preserveFieldErrors: true })
                }}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                disabled={!canAuth || isSubmitting}
                placeholder="••••••••"
                required
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive/40' : undefined}
                {...passwordField}
                onFocus={() => {
                  resetFeedback({ preserveFieldErrors: true })
                }}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{copy.helper}</p>

            <Button type="submit" disabled={!canAuth || isSubmitting} className="w-full">
              {isSubmitting ? 'Working…' : copy.action}
            </Button>
          </form>

          {errors.root && (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errors.root.message}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
              {message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="link"
            className="text-sm"
            onClick={() => {
              resetFeedback()
              setMode(mode === 'signin' ? 'signup' : 'signin')
              reset()
            }}
          >
            {copy.switchLabel}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Configure Supabase credentials in `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
