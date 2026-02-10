/**
 * CLI entry. Loaded by bin/cli.js (which provides shebang).
 */

import { getStatus, enable, disable } from './index.js';

const args = process.argv.slice(2);
const command = args[0] || 'status';

async function main(): Promise<void> {
  switch (command) {
    case 'on':
    case 'enable': {
      const status = await enable();
      console.log('Slow Mode enabled.', status);
      break;
    }
    case 'off':
    case 'disable': {
      const status = await disable();
      console.log('Slow Mode disabled.', status);
      break;
    }
    case 'status':
    default: {
      const status = getStatus();
      console.log('Slow Mode status:', status);
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
