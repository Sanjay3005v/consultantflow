
import AdminConsole from '@/components/admin-console';
import { getAllConsultants } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import Chatbot from '@/components/chatbot';

export default async function AdminPage() {
  const consultants = await getAllConsultants();

  return (
    <div className="relative">
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground">Manage, search, and generate reports for consultants.</p>
        </div>
        <AdminConsole consultants={consultants} />
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-lg z-20"
          >
            <MessageSquare className="w-8 h-8" />
            <span className="sr-only">Open Chat</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 bg-card/80 backdrop-blur-xl">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Admin Assistant</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <Chatbot />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
