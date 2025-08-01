
import Chatbot from '@/components/chatbot';

export default function ChatbotPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-2xl">
        <Chatbot />
      </div>
    </div>
  );
}
