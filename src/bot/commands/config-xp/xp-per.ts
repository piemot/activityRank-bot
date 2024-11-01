import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { stripIndent } from 'common-tags';
import { getGuildModel } from '../../models/guild/guildModel.js';
import { subcommand } from 'bot/util/registry/command.js';

const xpPerOption = (name: string, object: string, min: number, max: number) =>
  ({
    name,
    description: `The amount of XP gained per ${object}`,
    min_value: min,
    max_value: max,
    type: ApplicationCommandOptionType.Integer,
  }) as const;

export const xpPer = subcommand({
  data: {
    name: 'xp-per',
    description: 'Set the amount of XP gained from each source.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      xpPerOption('message', t('config.xp.messageSent'), 0, 10),
      xpPerOption('voiceminute', t('config.xp.minuteInVoice'), 0, 5),
      xpPerOption('vote', t('config.xp.upvote'), 0, 100),
      xpPerOption('invite', t('config.xp.memberInvited'), 0, 1_000),
    ],
  },
  async execute({ interaction }) {
    if (
      !interaction.channel ||
      !interaction.member.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageGuild)
    ) {
      await interaction.reply({
        content: t('config.xp.missingPerm'),
        ephemeral: true,
      });
      return;
    }

    const items = {
      xpPerTextMessage: interaction.options.getInteger('message') ?? undefined,
      xpPerVoiceMinute: interaction.options.getInteger('voiceminute') ?? undefined,
      xpPerVote: interaction.options.getInteger('vote') ?? undefined,
      xpPerInvite: interaction.options.getInteger('invite') ?? undefined,
    };

    if (Object.values(items).every((x) => x === undefined)) {
      await interaction.reply({
        content: t('config.xp.missingOption'),
        ephemeral: true,
      });
      return;
    }

    const cachedGuild = await getGuildModel(interaction.guild);
    await cachedGuild.upsert(items);

    await interaction.reply({
      embeds: [
        {
          author: { name: t('config.xp.xpValues') },
          color: 0x00ae86,
          description: t('config.xp.modifiedXPValues', items),
        },
      ],
      ephemeral: true,
    });
  },
});
