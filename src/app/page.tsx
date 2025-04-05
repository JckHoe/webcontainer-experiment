'use client';

import { useEffect, useState } from 'react';
import Terminal from '@/components/Terminal';
import { Terminal as XTerm } from 'xterm';
import {
  getWebContainerInstance,
  installDependencies,
  startDevServer,
  defaultFiles,
} from '@/lib/webcontainer';

export default function Home() {
  const [terminal, setTerminal] = useState<XTerm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!terminal) return;

    async function startWebContainer() {
      try {
        setIsLoading(true);
        const webcontainer = await getWebContainerInstance();
        
        // Write the files to the filesystem
        await webcontainer.mount(defaultFiles);

        // Install dependencies
        const exitCode = await installDependencies(terminal);
        if (exitCode !== 0) {
          throw new Error('Installation failed');
        }

        // Start the server
        await startDevServer(terminal);
        
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
        setIsLoading(false);
      }
    }

    startWebContainer();
  }, [terminal]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">WebContainer Demo</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-blue-600">
            Setting up WebContainer environment...
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-4">
          <Terminal onMount={setTerminal} />
        </div>

        <div className="prose">
          <h2>About this demo</h2>
          <p>
            This demo runs a Node.js server directly in your browser using WebContainer.
            The terminal above shows the server output. The server is running Express.js
            and responds to requests at port 3001.
          </p>
        </div>
      </div>
    </main>
  );
}
