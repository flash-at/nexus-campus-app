
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PasswordPromptProps {
    onSuccess: () => void;
}

const CORRECT_PASSWORD = '@CC-Pointsforfree';

export const PasswordPrompt = ({ onSuccess }: PasswordPromptProps) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            toast.success('Access Granted!');
            onSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            toast.error('Access Denied');
        }
    };

    return (
        <Card className="w-full max-w-sm animate-fade-in">
            <CardHeader className="text-center relative">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Back to home</span>
                </Button>
                <CardTitle className="text-2xl">CC-Points Portal</CardTitle>
                <CardDescription>Enter the password to access the Staff Portal.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Enter password"
                            className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Enter
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};
