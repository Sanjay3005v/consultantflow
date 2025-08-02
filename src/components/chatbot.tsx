
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callChatbot } from '@/app/actions';
import { usePathname } from 'next/navigation';

type Message = {
    role: 'user' | 'bot';
    content: string;
};

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const pathname = usePathname();

    useEffect(() => {
        // Start with a greeting from the bot
        setMessages([
            { role: 'bot', content: "Hello! I'm the ConsultantFlow assistant. How can I help you today?" }
        ]);
    }, []);

    useEffect(() => {
        // Scroll to the bottom when new messages are added
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // The history for the API should not include the user's latest message yet.
            const historyForApi = messages;
            const botResponse = await callChatbot(historyForApi, input, pathname);
            setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);

        } catch (error) {
            console.error('Error calling chatbot:', error);
            toast({
                title: 'Error',
                description: 'There was an issue communicating with the chatbot. Please try again.',
                variant: 'destructive',
            });
             setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, something went wrong. Could you please repeat that?" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-[70vh] flex flex-col">
            <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Ask me questions about using the ConsultantFlow application.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
                <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'bot' && (
                                    <Avatar>
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-lg px-4 py-2 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar>
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {loading && (
                            <div className="flex items-start gap-3">
                                <Avatar>
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
