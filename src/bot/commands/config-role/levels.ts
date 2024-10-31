import { ApplicationCommandOptionType, PermissionFlagsBits, type APIEmbed } from 'discord.js';
import { commaListsAnd } from 'common-tags';
import {
  fetchRoleAssignmentsByLevel,
  fetchRoleAssignmentsByRole,
  getRoleModel,
} from 'bot/models/guild/guildRoleModel.js';
import nameUtil from '../../util/nameUtil.js';
import { subcommand } from 'bot/util/registry/command.js';

export const levels = subcommand({
  data: {
    name: 'levels',
    description: 'Set assign/deassign levels for a role.',
    options: [
      {
        name: 'role',
        description: 'The role to modify.',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
      {
        name: 'assign-level',
        description: 'The level a member must be at to gain this role.',
        type: ApplicationCommandOptionType.Integer,
        min_value: 0,
        max_value: 500,
      },
      {
        name: 'deassign-level',
        description: 'The level a member must be at to lose this role.',
        type: ApplicationCommandOptionType.Integer,
        min_value: 0,
        max_value: 500,
      },
    ],
    type: ApplicationCommandOptionType.Subcommand,
  },
  async execute({ interaction }) {
    if (
      !interaction.channel ||
      !interaction.member.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageGuild)
    ) {
      await interaction.reply({
        content: t('config.role.missingPerms'),
        ephemeral: true,
      });
      return;
    }

    const resolvedRole = interaction.options.getRole('role', true);

    if (resolvedRole.id === interaction.guild.id) {
      await interaction.reply({
        content: t('config.role.everyone'),
        ephemeral: true,
        allowedMentions: { parse: [] },
      });
      return;
    }

    if (
      !interaction.guild.members.me ||
      !interaction.guild.members.me
        .permissionsIn(interaction.channel)
        .has(PermissionFlagsBits.ManageRoles)
    ) {
      await interaction.reply({
        content: t('config.role.manageRoles'),
        ephemeral: true,
      });
      return;
    }

    const items = {
      assignLevel: interaction.options.getInteger('assign-level'),
      deassignLevel: interaction.options.getInteger('deassign-level'),
    };

    if (items.assignLevel && items.deassignLevel && items.assignLevel >= items.deassignLevel) {
      await interaction.reply({
        content: t('config.role.error1', {items}),
        ephemeral: true,
      });
      return;
    }

    if (Object.values(items).every((x) => x === null)) {
      await interaction.reply({
        content: t('config.role.missingOption'),
        ephemeral: true,
      });
      return;
    }

    const cachedRole = await getRoleModel(resolvedRole);

    for (const _k in items) {
      const k = _k as keyof typeof items;
      const item = items[k];
      if (item === null) continue;

      const roleAssignmentsByLevel = await fetchRoleAssignmentsByLevel(interaction.guild, k, item);
      if (item !== 0 && roleAssignmentsByLevel.length >= 3) {
        await interaction.reply({
          content:
            t('config.roles.maxRoles'),
          ephemeral: true,
        });
        return;
      }
      await cachedRole.upsert({ [k]: item });
    }

    const roleAssignments = await fetchRoleAssignmentsByRole(interaction.guild, resolvedRole.id);

    const embed: APIEmbed = {
      author: { name: t('config.role.roleAdded') },
      color: 0x00ae86,
      description: nameUtil.getRoleMention(interaction.guild.roles.cache, resolvedRole.id),
    };

    const roleAssignLevels = roleAssignments
      .map((o) => (o.assignLevel !== 0 ? `\`${o.assignLevel}\`` : null))
      .filter((o) => o !== null);

    const roleDeassignLevels = roleAssignments
      .map((o) => (o.deassignLevel !== 0 ? `\`${o.deassignLevel}\`` : null))
      .filter((o) => o !== null);

    if (!roleAssignLevels.every((o) => o === null)) {
      embed.fields = [
        ...(embed.fields ?? []),
        { name: t('config.role.assignlevel'), value: commaListsAnd(`${roleAssignLevels}`) },
      ];
    }

    if (!roleDeassignLevels.every((o) => o === null)) {
      embed.fields = [
        ...(embed.fields ?? []),
        { name: t('config.role.deassignlevel'), value: commaListsAnd(`${roleDeassignLevels}`) },
      ];
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
});
