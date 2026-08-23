import { styleText } from 'node:util';
import * as p from '@clack/prompts';
import type { RESTPutAPIApplicationCommandsJSONBody } from '@discordjs/core';
import { Command, Option } from 'clipanion';
import type { RESTPutAPIApplicationGuildCommandsJSONBody } from 'discord-api-types/v10';
import t from 'typanion';
import { ConfigurableCommand2 } from '../util/classes.ts';
import { Deploy } from '../util/commandSchema.ts';

export class DeployCommand extends ConfigurableCommand2 {
  static override paths = [['deploy']];
  static override usage = Command.Usage({
    category: 'Deploy',
    description: 'Deploy Slash Commands to Discord.',
    details: `
      Deploy the bot's Slash Commands.

      If the \`--global\` flag is set, all commands that are \`deploy: Global\` will be deployed globally.
      A list of servers from \`config.developmentGuilds\` and the \`--local\` flag will be shown to deploy \`LocalOnly\` commands into.
    `,
    examples: [
      ['Deploy all global commands to all servers', '$0 deploy --global'],
      ['Update local commands in `config.developmentServers`', '$0 deploy'],
      [
        'Deploy all global commands to a list of servers',
        '$0 deploy --local 123456789123456789 --local 234567890234567890 --deploy-global=local',
      ],
    ],
  });

  global = Option.Boolean('-g,--global', {
    description: 'Whether to deploy commands globally.',
    required: false,
  });

  local = Option.Array('-l,--local', {
    description: 'Guilds to deploy local commands into.',
    required: false,
  });

  globalDeploy = Option.String('--deploy-global', {
    description:
      'How to deploy Global commands (default: `global`). \
      Setting `--deploy-global=local` only deploys global commands to guilds specified with the `--local` flag.',
    required: false,
    validator: t.isOneOf([t.isLiteral('global'), t.isLiteral('local'), t.isLiteral('never')]),
  });

  override async execute() {
    p.intro(styleText(['bgCyan', 'blackBright'], '  Deploy Commands  '));

    const { api, config } = await this.loadBaseConfig();

    const ownUser = await api.users.getCurrent();

    p.log.info(
      `Deploying commands for: ${styleText('blueBright', `${ownUser.username}#${ownUser.discriminator}`)} (${styleText('dim', ownUser.id)})`,
    );

    this.globalDeploy ??= 'global';

    const commands = await this.getDeployableCommands();

    const globalCommands: RESTPutAPIApplicationCommandsJSONBody = commands.filter(
      (c) => c.deployment === Deploy.Global,
    );
    const localCommands: RESTPutAPIApplicationGuildCommandsJSONBody =
      this.globalDeploy === 'local'
        ? commands.filter(
            (c) => c.deployment === Deploy.LocalOnly || c.deployment === Deploy.Global,
          )
        : commands.filter((c) => c.deployment === Deploy.LocalOnly);

    if (this.global && this.globalDeploy === 'never') {
      p.log.warn(
        `Skipped deploying commands globally because ${styleText('magenta', '--deploy-global=never')}`,
      );
    } else if (this.global && this.globalDeploy === 'global') {
      const confirm = await p.confirm({
        message: `Are you sure you would like to ${styleText('bold', `deploy ${styleText('green', globalCommands.length.toString())} global commands`)}?`,
        initialValue: true,
      });
      if (p.isCancel(confirm)) {
        p.cancel('Cancelled.');
        return 8;
      }
      if (confirm) {
        const spin = p.spinner();
        spin.start('Deploying global commands');
        await api.applicationCommands.bulkOverwriteGlobalCommands(ownUser.id, globalCommands);
        spin.stop('Deployed global commands');
      }
    }

    const localServers = new Set([...(this.local ?? []), ...config.developmentServers]);
    const guildsData = await Promise.all(
      [...localServers].map(
        async (id) =>
          await api.guilds.get(id).then(
            (guild) => ({ success: true as const, id, guild }),
            () => ({ success: false as const, id }),
          ),
      ),
    );

    for (const guild of guildsData.filter((s) => !s.success)) {
      p.log.warn(`Failed to fetch guild info for ${styleText(['underline', 'yellow'], guild.id)}.`);
    }

    const validGuilds = guildsData.filter((s) => s.success);

    const selected = await p.multiselect({
      message: `Confirm which guilds you would like to ${styleText('bold', `update ${styleText('green', localCommands.length.toString())} local commands in`)}.`,
      options: validGuilds.map(({ guild }) => ({
        value: guild.id,
        label: guild.name,
        hint: `${guild.id}${config.developmentServers.includes(guild.id) ? ` • from ${styleText('blue', 'config.developmentServers')}` : ''}`,
      })),
      // all guilds are selected by default
      initialValues: validGuilds.map((guild) => guild.id),
    });

    if (p.isCancel(selected)) {
      p.cancel('Cancelled.');
      return 8;
    }

    if (selected.length > 0) {
      const spin = p.spinner();
      spin.start('Deploying local commands');

      for (const guildId of selected) {
        const name = validGuilds.find((g) => g.id === guildId)?.guild.name;
        spin.message(`Deploying local commands • ${name}`);
        await api.applicationCommands.bulkOverwriteGuildCommands(
          ownUser.id,
          guildId,
          localCommands,
        );
      }
      spin.stop('Deployed local commands');
    }
  }
}
