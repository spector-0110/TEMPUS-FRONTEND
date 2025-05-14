import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { resetPassword, checkUserExists } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Spinner } from "@/components/ui/Spinner"

export function ForgetPasswordForm({className, onLoginClick, ...props}) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);

    // Handle countdown timer
    useEffect(() => {
        let timer;
        if (cooldownTime > 0) {
            timer = setInterval(() => {
                setCooldownTime(prev => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        // Cleanup function to clear interval
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [cooldownTime]); // Only re-run effect if cooldownTime changes

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            // First check if user exists
            const userExists = await checkUserExists(email);
            
            if (!userExists) {
                setError("No account found with this email address. Please check your email or sign up for a new account.");
                return;
            }

            // If user exists, proceed with password reset
            const isResetSuccessful = await resetPassword(email);
            if (isResetSuccessful) {
                setSuccess(true);
                setCooldownTime(60); // Set cooldown timer to 60 seconds
            } else {
                setError("Failed to send reset email. Please try again later.");
            }
        } catch (err) {
            // Check if it's a rate limiting error
            if (err.message?.toLowerCase().includes('security purposes') || 
                err.message?.toLowerCase().includes('rate limit')) {
                const seconds = err.message.match(/\d+/)?.[0] || 60;
                setCooldownTime(parseInt(seconds));
                setError(`For security purposes, please wait ${seconds} seconds before requesting another reset link.`);
            } else {
                setError(err.message || "Failed to send reset email. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                {/* <p className="text-balance text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                </p> */}
            </div>
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md">
                    Password reset link has been sent to your email. Please check your inbox and follow the instructions.
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
                <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || success || cooldownTime > 0}
                >
                    {loading ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            sending reset link...
                        </>
                    ) : cooldownTime > 0 ? (
                        `Try again in ${cooldownTime}s`
                    ) : success ? (
                        "Reset link sent"
                    ) : (
                        "Send reset link"
                    )}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or
                </span>
            </div>
            <div className="text-center text-sm">
                {success ? (
                    <>
                        Didn't receive the email?{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setSuccess(false);
                                setError("");
                            }}
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Try again
                        </button>
                    </>
                ) : (
                    <>
                        Remember your password?{" "}
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Back to login
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}

export default ForgetPasswordForm;