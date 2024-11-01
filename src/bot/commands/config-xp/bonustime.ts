import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { getGuildModel } from '../../models/guild/guildModel.js';
import { subcommand } from 'bot/util/registry/command.js';

export const bonustime = subcommand({
  data: {
    name: 'bonustime',
    description: 'Start bonustime for a specified duration.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'time',
        description: 'The time for the bonustime to last, in minutes',
        type: ApplicationCommandOptionType.Integer,
        required: true,
        autocomplete: true,
        min_value: 0,
        max_value: 60 * 24 * 14,
      },
    ],
  },
  async execute({ interaction }) {
    if (
      !interaction.member.permissionsIn(interaction.channel!).has(PermissionFlagsBits.ManageGuild)
    ) {
      await interaction.reply({
        content: t('config.xp.missingPerm'),
        ephemeral: true,
      });
      return;
    }
    const cachedGuild = await getGuildModel(interaction.guild);

    const bonusUntilDate = Math.floor(
      Date.now() / 1000 + interaction.options.getInteger('time', true) * 60,
    );
    await cachedGuild.upsert({ bonusUntilDate: bonusUntilDate.toString() });

    if (bonusUntilDate <= Date.now() / 1000) {
      await interaction.reply({ content: t('config.xp.bonusEnd') });
      return;
    }

    await interaction.reply({
      content: t('config.xp.bonusStart', { bonusUntilDate} ),
    });
  },
  autocomplete: {
    async time({ interaction }) {
      await interaction.respond([
        { name: t('config.xp.endNow'), value: 0 },
        { name: t('config.xp.1h'), value: 60 },
        { name: t('config.xp.3h'), value: 60 * 3 },
        { name: t('config.xp.12h'), value: 60 * 12 },
        { name: t('config.xp.1d'), value: 60 * 24 },
        { name: t('config.xp.3d'), value: 60 * 24 * 3 },
        { name: t('config.xp.1w'), value: 60 * 24 * 7 },
        { name: t('config.xp.2w'), value: 60 * 24 * 14 },
      ]);
    },
  },
});
