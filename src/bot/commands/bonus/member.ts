import { PermissionFlagsBits, ApplicationCommandOptionType } from 'discord.js';
import statFlushCache from '../../statFlushCache.js';
import { subcommand } from 'bot/util/registry/command.js';

export const member = subcommand({
  data: {
    name: 'member',
    description: 'Change the bonus XP of a member.',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
      {
        name: 'member',
        description: 'The member to modify the bonus XP of.',
        required: true,
        type: ApplicationCommandOptionType.User,
      },
      {
        name: 'change',
        description: 'The amount of XP to give to the member. This option may be negative.',
        min_value: -1_000_000,
        max_value: 1_000_000,
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },
  async execute({ interaction }) {
    const member = interaction.options.getMember('member');

    if (!member) {
      await interaction.reply({
        content: t('bonus.notInServer'),
        ephemeral: true,
      });
      return;
    }

    if (member.user.bot) {
      await interaction.reply({
        content: t('bonus.cannotAddXP'),
        ephemeral: true,
      });
      return;
    }

    const change = interaction.options.getInteger('change', true);

    await statFlushCache.addBonus(member, change);
    await interaction.reply({
      content: `${t('bonus.success', {change, member})}`,
      allowedMentions: { parse: [] },
    });
  },
});
