import { command } from 'bot/util/registry/command.js';
import {
  ApplicationCommandOptionType,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  GuildMember,
} from 'discord.js';
import { getGuildModel } from 'bot/models/guild/guildModel.js';
import { getMemberModel } from '../models/guild/guildMemberModel.js';
import statFlushCache from '../statFlushCache.js';
import fct from '../../util/fct.js';
import { useConfirm } from 'bot/util/component.js';
import { requireUser } from 'bot/util/predicates.js';

export default command.basic({
  data: {
    name: 'inviter',
    description: 'Set a member as your inviter',
    options: [
      {
        name: 'member',
        description: 'The user that invited you to the server',
        required: true,
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
  async execute({ interaction }) {
    const member = interaction.options.getMember('member');

    if (!member) {
      await interaction.reply({
        content: t('missing.notOnServer'),
        ephemeral: true,
      });
      return;
    }

    const cachedGuild = await getGuildModel(interaction.guild);

    if (!cachedGuild.db.inviteXp) {
      await interaction.reply({
        content: t('inviter.disabled'),
        ephemeral: true,
      });
      return;
    }

    if (member.id == interaction.member.id) {
      await interaction.reply({
        content: t('inviter.ownInviter'),
        ephemeral: true,
      });
      return;
    }

    const cachedMember = await getMemberModel(interaction.member);
    const myMember = await cachedMember.fetch();
    const cachedTarget = await getMemberModel(member);
    const myTarget = await cachedTarget.fetch();

    if (myMember.inviter !== '0') {
      await interaction.reply({
        content: t('inviter.alreadySet'),
        ephemeral: true,
      });
      return;
    } else if (myTarget.inviter === interaction.member.id) {
      await interaction.reply({
        content: t('inviter.invited'),
        ephemeral: true,
      });
      return;
    } else if (member.user.bot) {
      await interaction.reply({
        content: t('inviter.bot'),
        ephemeral: true,
      });
      return;
    }

    if (await fct.hasNoXpRole(member)) {
      await interaction.reply({
        content:
          t('inviter.noXP'),
        ephemeral: true,
      });
      return;
    }

    await confirmInviter(interaction, member);
  },
});

async function confirmInviter(
  interaction: ChatInputCommandInteraction<'cached'>,
  inviter: GuildMember,
) {
  const predicate = requireUser(interaction.user);
  await interaction.reply({
    content: t('inviter.confirmation', inviter),
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            customId: confirmButton.instanceId({ data: { inviter }, predicate }),
            style: ButtonStyle.Primary,
            label: t('inviter.confirm'),
          },
          {
            type: ComponentType.Button,
            customId: denyButton.instanceId({ predicate }),
            style: ButtonStyle.Secondary,
            label: t('inviter.cancel'),
          },
        ],
      },
    ],
    allowedMentions: { users: [] },
  });
}

const { confirmButton, denyButton } = useConfirm<{
  inviter: GuildMember;
}>({
  async confirmFn({ interaction, data, drop }) {
    await interaction.deferUpdate();

    const cachedMember = await getMemberModel(interaction.member);
    await cachedMember.upsert({ inviter: data.inviter.id });

    await statFlushCache.addInvite(data.inviter, 1);
    await statFlushCache.addInvite(interaction.member, 1);

    await interaction.editReply({
      content:
        t('inviter.success'),
      components: [],
    });
    drop();
  },
  async denyFn({ interaction, drop }) {
    await interaction.deferUpdate();
    await interaction.deleteReply();
    drop();
  },
});
