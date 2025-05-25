import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/Spinner"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import supabase from "@/lib/supabase"

export function ResetPasswordForm({ className, ...props }) {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.updateUser({ 
                password: newPassword 
            });
            
            if (error) throw error;

            // Show success message and redirect
            alert("Password updated successfully!");
            router.push("/");
        } catch (err) {
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your new password below
                </p>
            </div>
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input 
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Input 
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Updating password...
                        </>
                    ) : (
                        "Reset password"
                    )}
                </Button>
            </div>
        </form>
    );
}
