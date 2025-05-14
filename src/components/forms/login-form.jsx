import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { signInWithEmail, signInWithGoogle } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Spinner } from "@/components/ui/Spinner"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

export function LoginForm({className, onSignUpClick, onForgetPasswordClick, ...props}) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmail(email, password);
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setError("");
        setGoogleLoading(true);
        try {
            await signInWithGoogle();
            // The redirect will happen automatically
        } catch (err) {
            setError("Error signing in with Google");
            setGoogleLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="xyz@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                            type="button"
                            onClick={onForgetPasswordClick}
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </button>
                    </div>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <EyeIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Logging in...
                        </>
                    ) : (
                        "Login"
                    )}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
            <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Connecting to Google...
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Login with Gmail
                    </>
                )}
            </Button>
            <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <button
                    type="button"
                    onClick={onSignUpClick}
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Sign up
                </button>
            </div>
        </form>
    )
}
