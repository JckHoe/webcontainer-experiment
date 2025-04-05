import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer;

export async function getWebContainerInstance() {
  if (!webcontainerInstance) {
    webcontainerInstance = await WebContainer.boot();
  }
  return webcontainerInstance;
}

export async function installDependencies(terminal: any) {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  
  installProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));
  
  return installProcess.exit;
}

export async function startDevServer(terminal: any) {
  const serverProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
  
  serverProcess.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));

  // Wait for server to be ready
  const ready = await new Promise<void>((resolve) => {
    webcontainerInstance.on('server-ready', (port, url) => {
      resolve();
    });
  });

  return serverProcess;
}

export type FileSystemTree = {
  [key: string]: {
    file?: { contents: string };
    directory?: FileSystemTree;
  };
};

export const defaultFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'example-app',
        type: 'module',
        dependencies: {
          express: '^4.18.2'
        },
        scripts: {
          start: 'node server.js'
        }
      }, null, 2)
    }
  },
  'server.js': {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from WebContainer!' });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`
    }
  }
}; 