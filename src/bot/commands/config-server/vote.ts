import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { stripIndent } from 'common-tags';
import { getGuildModel } from '../../models/guild/guildModel.js';
import { parseEmojiString } from 'bot/util/emoji.js';
import { subcommand } from 'bot/util/registry/command.js';

export const vote = subcommand({
  data: {
    name: 'vote',
    description: 'Set your voteTag and emote.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'tag',
        description: 'The voteTag to set.',
        type: ApplicationCommandOptionType.String,
      },
      {
        name: 'emote',
        description: 'The voteEmote to set.',
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
  async execute({ interaction }) {
    if (
      !interaction.member.permissionsIn(interaction.channel!).has(PermissionFlagsBits.ManageGuild)
    ) {
      await interaction.reply({
        content: t('config.server.missingPerm'),
        ephemeral: true,
      });
      return;
    }

    const rawVoteEmote = interaction.options.getString('emote');
    const items = {
      voteEmote: (rawVoteEmote && parseEmojiString(rawVoteEmote)) ?? undefined,
      voteTag: interaction.options.getString('tag') ?? undefined,
    };

    if (Object.values(items).every((x) => x === undefined)) {
      await interaction.reply({
        content: t('config.server.missingOption'),
        ephemeral: true,
      });
      return;
    }

    const cachedGuild = await getGuildModel(interaction.guild);
    await cachedGuild.upsert(items);

    await interaction.reply({
      embeds: [
        {
          author: { name: t('config.server.voteTitle') },
          color: 0x00ae86,
          description: t('config.server.modifiedVote', {items}),
        },
      ],
      ephemeral: true,
    });
  },
});
