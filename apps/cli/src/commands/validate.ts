import { styleText } from 'node:util';
import { Command } from 'clipanion';
import { ConfigurableCommand2 } from '../util/classes.ts';
import { commandsSchema } from '../util/commandSchema.ts';

export class ValidateCommand extends ConfigurableCommand2 {
  static override paths = [['validate']];
  static override usage = Command.Usage({
    category: 'Develop',
    description: `Validate ${styleText('green', 'config/commands.json')}.`,
    details: `
      Checks that ${styleText('green', 'config/commands.json')} is a valid list of commands.
    `,
  });

  override async execute() {
    const loader = await this.getConfigLoader();
    await loader.loadConfig('commands', { schema: commandsSchema });

    console.log(styleText('green', '✔︎ commands.json validated'));
  }
}
