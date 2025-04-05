import { WebContainer } from '@webcontainer/api';
import type { FileSystemTree } from '@webcontainer/api';
import { Terminal } from 'xterm';

let webcontainerInstance: WebContainer;

export async function getWebContainerInstance() {
  if (!webcontainerInstance) {
    webcontainerInstance = await WebContainer.boot();
  }
  return webcontainerInstance;
}

export async function runNpxCommand(terminal: Terminal, command: string[]) {
  const process = await webcontainerInstance.spawn('npx', command, {
    terminal: {
      cols: 80,
      rows: 24,
    },
  });

  // Connect stdio to terminal
  process.output.pipeTo(new WritableStream({
    write(data: string) {
      terminal.write(data);
    }
  }));

  // Connect terminal input to process stdin
  terminal.onData((data: string) => {
    process.input.write(data);
  });

  return process;
}

// Basic package.json to ensure npm/npx is available
export const defaultFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'npx-runner',
        type: 'module',
        version: '1.0.0',
        private: true
      }, null, 2)
    }
  }
}; 