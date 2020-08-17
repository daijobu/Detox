#!/usr/bin/env node
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

function main([_$0, _detox, ...cliArgs]) {
  const [command] = cliArgs;

  if (command === 'recorder' && process.platform === 'darwin') {
    return spawnRecorder(cliArgs);
  } else {
    return spawnDetoxBinary(cliArgs);
  }
}

function spawnDetoxBinary(cliArgs) {
  const isWin32 = process.platform === 'win32';
  const nodeBinariesPath = path.join(process.cwd(), 'node_modules/.bin');
  const binaryPath = path.join(nodeBinariesPath, `detox${isWin32 ? '.cmd' : ''}`);

  if (!fs.existsSync(binaryPath)) {
    console.log(`Failed to find Detox executable at path: ${binaryPath}`);
    console.log(`\nPossible solutions:`);
    console.log(`1. Make sure your current working directory is correct.`);
    console.log(`2. Run "npm install" to ensure your "node_modules" directory is up-to-date.`);
    console.log(`3. Run "npm install detox --save-dev" for the fresh Detox installation in your project.\n`);

    return 1;
  }

  const spawnOptions = {
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: [nodeBinariesPath, process.env.PATH].join(path.delimiter),
    }
  };

  const result = isWin32
    // { shell: true } option seems to break quoting on windows? Otherwise this would be much simpler.
    ? cp.spawnSync('cmd', ['/c', binaryPath, ...cliArgs], spawnOptions)
    : cp.spawnSync(binaryPath, cliArgs, spawnOptions);

  return result.status;
}

function spawnRecorder([_recorder, ...recorderArgs]) {
  const detoxRecorderPath = path.join(process.cwd(), 'node_modules/detox-recorder');
  const detoxRecorderCLIPath = path.join(detoxRecorderPath, 'DetoxRecorderCLI');

  if (fs.existsSync(detoxRecorderCLIPath)) {
    const result = cp.spawnSync(detoxRecorderCLIPath, recorderArgs, { stdio: 'inherit' });
    return result.status;
  } else {
    console.log(`Detox Recorder is not installed in this directory: ${detoxRecorderPath}`);
    return 1;
  }
}

process.exit(main(process.argv));
