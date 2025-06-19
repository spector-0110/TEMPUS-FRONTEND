"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { signInWithEmail, signInWithGoogle } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export function LoginForm({ className, onSignUpClick, onForgetPasswordClick, ...props }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError("")
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err?.message || "Error signing in with Google")
      setGoogleLoading(false)
    }
  }

return (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn("flex justify-center items-center min-h-screen p-4", className)}
    >
        <Card className="w-full max-w-md shadow-2xl backdrop-blur-3xl bg-neutral-900/40 rounded-3xl">
            <CardHeader className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
            </CardHeader>

            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-md text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Email */}
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || googleLoading}
                            required
                            className="focus-visible:ring-2 focus-visible:ring-primary transition"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button
                                type="button"
                                onClick={onForgetPasswordClick}
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading || googleLoading}
                                required
                                placeholder="••••••"

                                className="pr-10 focus-visible:ring-2 focus-visible:ring-primary transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="w-full h-11 font-semibold transition-all duration-200 hover:scale-[1.02]"
                    >
                        {loading && <Spinner className="mr-2" />}
                        Sign in
                    </Button>

                    {/* Divider */}
                    <div className="relative my-2 animate-in fade-in slide-in-from-left-1 duration-700 delay-500">
                            <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or</span>
                            </div>
                    </div>

                    {/* Google Sign-in */}
                    <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 font-medium"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                >
                    {googleLoading ? (
                        <Spinner className="mr-2" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    Google
                </Button>
                </form>
            </CardContent>

            <CardFooter className="text-center">
                <p className="text-sm text-muted-foreground w-full">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSignUpClick}
                        className="text-primary font-medium hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            </CardFooter>
        </Card>
    </motion.div>
)
}