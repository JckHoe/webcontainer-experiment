'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onMount?: (terminal: XTerm) => void;
}

export default function Terminal({ onMount }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1a1b26',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;

    if (onMount) {
      onMount(terminal);
    }

    const resizeHandler = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      terminal.dispose();
    };
  }, [onMount]);

  return (
    <div className="w-full h-[300px] bg-[#1a1b26] rounded-lg overflow-hidden">
      <div ref={terminalRef} className="h-full" />
    </div>
  );
} 