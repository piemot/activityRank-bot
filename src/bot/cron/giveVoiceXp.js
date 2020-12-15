const levelManager = require('../levelManager.js');
const fct = require('../../util/fct.js');
const guildChannelModel = require('../models/guild/guildChannelModel.js');
const guildRoleModel = require('../models/guild/guildRoleModel.js');
const guildMemberModel = require('../models/guild/guildMemberModel.js');
const guildModel = require('../models/guild/guildModel.js');
const skip = require('../skip.js');
const rankVoiceMember = require('../util/rankVoiceMember.js');

exports.start = async (client) => {
  let hrstart,hrend;

  while (true) {
    hrstart = process.hrtime();

    for (let guild of client.guilds.cache) {
      guild = guild[1];

      try {
        await fct.sleep(350);

        if (!skip(guild.id))
          await rankVoiceGuild(guild);

      } catch (e) { console.log(e); }
    }

    try {
      await fct.sleep(10000);
    } catch (e) { console.log(e); }

    rankVoiceMember.round++;
    console.log('RankVoice round finished after ' + Math.round(process.hrtime(hrstart)[0] / 60) + 'm.');
  }
}

//existTwoUnmutedMembers(channel.members)) { && guildchannel.noxp != 1
const rankVoiceGuild = (guild) => {
  return new Promise(async function(resolve, reject) {
    try {
      let oldTotalScore,newTotalScore,noXp;
      let active = false;

      await guildModel.cache.load(guild);

      if (!guild.appData.voiceXp)
        return resolve();

      const voiceChannels = guild.channels.cache.filter(channel => channel.type == 'voice');

      for  (let channel of voiceChannels) {
        channel = channel[1];
        await guildChannelModel.cache.load(channel);

        if (!channel.appData.noXp)
          await rankVoiceChannel(channel);
      }

      resolve();
    } catch (e) { reject(e); }
  });
}

const rankVoiceChannel = (channel) => {
  return new Promise(async function(resolve, reject) {
    try {
      for (let member of channel.members) {
        member = member[1];
        await guildMemberModel.cache.load(member);

        if (await noXp(channel,member))
          continue;

        await rankVoiceMember(member,channel);
        await fct.sleep(350);
      }
      resolve();
    } catch (e) { reject(e); }
  });
}

const noXp = (channel,member) => {
  return new Promise(async function(resolve, reject) {
    try {
      if (member.user.bot)
        return resolve(true);

      if (!member.guild.appData.allowMutedXp && (member.voice.selfMute || member.voice.serverMute))
        return resolve(true);

      if (!member.guild.appData.allowDeafenedXp && (member.voice.selfDeaf || member.voice.serverDeaf))
        return resolve(true);

      if (!member.guild.appData.allowSoloXp && channel.members.size < 2)
        return resolve(true);

      //if (!member.guild.appData.allowInvisibleXp && member.user.presence.status == 'offline')
        //return resolve(true);

      for (let role of member.roles.cache) {
        role = role[1];
        await guildRoleModel.cache.load(role);

        if (role.appData.noXp)
          return resolve(true);
      }

      return resolve(false);
    } catch (e) { reject(e); }
  });
}

/*
function existTwoUnmutedMembers(members) {
  if (members.size < 2)
    return false;

  let nrOfActiveMembers = 0;
  for (let member of members) {
    member = member[1];
    if(member.voice.selfMute == false && member.voice.serverMute == false && member.user.bot == false)
      nrOfActiveMembers++;
  }

  if (nrOfActiveMembers >=2)
    return true;
  else
    return false;
}*/
