import type { AssistantReply, RemoteProvider } from '@/lib/aiEngine'

declare global {
  interface Window {
    /**
     * A small hook used by the automated checks against a development build.
     *
     * It never holds an API key and it never makes a request on its own:
     * with no provider registered the assistant answers from the local,
     * offline knowledge base. The hook is removed again when the page is
     * left, and it is never installed in a production build.
     */
    __kisansathiAi?: {
      /** Registers (or clears) the optional remote provider. */
      setRemoteProvider: (provider: RemoteProvider | null) => void
      /** Asks a question and returns the full reply. */
      ask: (question: string) => Promise<AssistantReply>
    }
  }
}

export {}
