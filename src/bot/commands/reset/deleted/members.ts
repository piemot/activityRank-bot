import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';
import { subcommand } from 'bot/util/registry/command.js';
import { useConfirm } from 'bot/util/component.js';
import { requireUser } from 'bot/util/predicates.js';
import { fetchDeletedUserIds, ResetGuildMembersStatisticsAndXp } from 'bot/models/resetModel.js';

export const members = subcommand({
  data: {
    name: 'members',
    description: 'Reset the statistics of all members that have left the server.',
    type: ApplicationCommandOptionType.Subcommand,
  },
  async execute({ interaction }) {
    const userIds = await fetchDeletedUserIds(interaction.guild);

    if (userIds.length < 1) {
      await interaction.reply({ content: 'There are no users to reset.' });
      return;
    }

    const predicate = requireUser(interaction.user);

    const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(confirmButton.instanceId({ data: { userIds }, predicate }))
        .setLabel('Reset')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(denyButton.instanceId({ predicate }))
        .setLabel('Cancel')
        .setEmoji('❎')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({
      content: t('reset.deleted.confirmationUser', userIds.length),
      ephemeral: true,
      components: [confirmRow],
    });
  },
});

const { confirmButton, denyButton } = useConfirm<{ userIds: string[] }>({
  async confirmFn({ interaction, data }) {
    const job = new ResetGuildMembersStatisticsAndXp(interaction.guild, data.userIds);

    await interaction.update({ content: t('reset.preparing'), components: [] });

    await job.plan();
    await job.logStatus(interaction);

    await job.runUntilComplete({
      onPause: async () => await job.logStatus(interaction),
      globalBufferTime: 100,
      jobBufferTime: 2000,
    });
    await job.logStatus(interaction);
  },
  async denyFn({ interaction }) {
    await interaction.update({ components: [], content: t('reset.cancelled') });
  },
});
