import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { stripIndent } from 'common-tags';
import { getGuildModel } from '../../models/guild/guildModel.js';
import prettyTime from 'pretty-ms';
import { subcommand } from 'bot/util/registry/command.js';

export const cooldown = subcommand({
  data: {
    name: 'cooldown',
    description: 'Change the message and vote cooldowns.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'message',
        description: 'The time between messages that can count for XP.',
        min_value: 0,
        max_value: 120,
        type: ApplicationCommandOptionType.Integer,
        autocomplete: true,
      },
      {
        name: 'vote',
        description: 'The time members must wait between upvotes.',
        min_value: 180,
        max_value: 86400,
        type: ApplicationCommandOptionType.Integer,
        autocomplete: true,
      },
    ],
  },
  async execute({ interaction }) {
    if (
      !interaction.member.permissionsIn(interaction.channel!).has(PermissionFlagsBits.ManageGuild)
    ) {
      await interaction.reply({
        content: t('missing.manageServer'),
        ephemeral: true,
      });
      return;
    }

    const items = {
      textMessageCooldownSeconds: interaction.options.getInteger('message') ?? undefined,
      voteCooldownSeconds: interaction.options.getInteger('vote') ?? undefined,
    };
    if (Object.values(items).every((x) => x === undefined)) {
      await interaction.reply({
        content: t('missing.option'),
        ephemeral: true,
      });
      return;
    }

    const cachedGuild = await getGuildModel(interaction.guild);
    await cachedGuild.upsert(items);

    const pretty = (sec: number) => prettyTime(sec * 1000, { verbose: true });

    await interaction.reply({
      embeds: [
        {
          author: { name: t('config.server.values') },
          color: 0x00ae86,
          description: t('config.server.modifiedCD', cachedGuild.db),
        },
      ],
      ephemeral: true,
    });
  },
  autocomplete: {
    async message({ interaction }) {
      await interaction.respond([
        { name: t('config.server.noCD'), value: 0 },
        { name: t('config.server.5sec'), value: 5 },
        { name: t('config.server.15sec'), value: 15 },
        { name: t('config.server.30sec'), value: 30 },
        { name: t('config.server.1min'), value: 60 },
        { name: t('config.server.2min'), value: 120 },
      ]);
    },
    async vote({ interaction }) {
      await interaction.respond([
        { name: t('config.server.3min'), value: 60 * 3 },
        { name: t('config.server.5min'), value: 60 * 5 },
        { name: t('config.server.10min'), value: 60 * 10 },
        { name: t('config.server.30min'), value: 60 * 30 },
        { name: t('config.server.1h'), value: 60 * 60 },
        { name: t('config.server.3h'), value: 60 * 60 * 3 },
        { name: t('config.server.6h'), value: 60 * 60 * 6 },
        { name: t('config.server.12h'), value: 60 * 60 * 12 },
        { name: t('config.server.24h'), value: 60 * 60 * 24 },
      ]);
    },
  },
});
