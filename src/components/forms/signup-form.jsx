import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { signUpWithEmail, checkUserExists, signUpWithGoogle } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/Spinner"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

export function SignUpForm({className, onLoginClick, ...props}) {
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
            // Check if user already exists
            const userExists = await checkUserExists(email);
            if (userExists) {
                setError("An account with this email already exists");
                return;
            }

            // Attempt to sign up
            await signUpWithEmail(email, password);
            
            // Show success message
            alert("Please check your email to verify your account");
            
            // Switch to login form
            onLoginClick();
        } catch (err) {
            setError(err.message || "Something went wrong during signup");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignUp() {
        setError("");
        setGoogleLoading(true);
        try {
            await signUpWithGoogle();
            // The redirect will happen automatically
        } catch (err) {
            setError("Error signing up with Google");
            setGoogleLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to create your account
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
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6} 
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
                    <p className="text-sm text-muted-foreground">
                        Must be at least 6 characters
                    </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Creating account...
                        </>
                    ) : (
                        "Create account"
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
                onClick={handleGoogleSignUp}
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
                        Sign up with Gmail
                    </>
                )}
            </Button>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={onLoginClick}
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Login
                </button>
            </div>
        </form>
    )
}
