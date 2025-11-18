'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Consulta con MARTIN</h1>
          <p className="text-sm text-muted-foreground">
            Tu asistente médico inteligente
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full max-w-4xl">
          <ChatInterface
            sessionId={currentSessionId}
            onSessionCreate={setCurrentSessionId}
          />
        </div>
      </div>
    </div>
  );
}
