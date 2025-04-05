'use client';

import { useEffect, useState, useCallback } from 'react';
import Terminal from '@/components/Terminal';
import { Terminal as XTerm } from 'xterm';
import {
  getWebContainerInstance,
  runNpxCommand,
  defaultFiles,
} from '@/lib/webcontainer';

export default function Home() {
  const [terminal, setTerminal] = useState<XTerm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState('create-next-app@latest my-app --typescript');
  const [currentProcess, setCurrentProcess] = useState<any>(null);

  const runCommand = useCallback(async () => {
    if (!terminal) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const webcontainer = await getWebContainerInstance();
      await webcontainer.mount(defaultFiles);

      // Split command string into array and remove empty strings
      const commandParts = command.split(' ').filter(Boolean);
      const process = await runNpxCommand(terminal, commandParts);
      setCurrentProcess(process);
      
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
      setIsLoading(false);
    }
  }, [terminal, command]);

  const stopCommand = useCallback(async () => {
    if (currentProcess) {
      try {
        await currentProcess.kill();
        setCurrentProcess(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to stop process');
      }
    }
  }, [currentProcess]);

  useEffect(() => {
    if (!terminal) return;

    const initWebContainer = async () => {
      try {
        await getWebContainerInstance();
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to initialize WebContainer');
        setIsLoading(false);
      }
    };

    initWebContainer();
  }, [terminal]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">NPX Command Runner</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter npx command..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={currentProcess ? stopCommand : runCommand}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              currentProcess 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : currentProcess ? 'Stop' : 'Run'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <Terminal onMount={setTerminal} />
        </div>

        <div className="prose">
          <h2>About this demo</h2>
          <p>
            This demo allows you to run any npx command directly in your browser using WebContainer.
            The terminal above shows the command output and allows interaction with the process.
            You can start development servers, create new projects, or run any other npx command.
          </p>
          <h3>Example commands:</h3>
          <ul>
            <li><code>create-next-app@latest my-app --typescript</code></li>
            <li><code>create-react-app my-react-app</code></li>
            <li><code>serve .</code></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
