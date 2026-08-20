import { createWriteStream } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { Writable } from 'node:stream';
import { styleText } from 'node:util';
import type { schemas } from '@activityrank/cfg';
import * as p from '@clack/prompts';
import type { API } from '@discordjs/core';
import { Command, Option, UsageError } from 'clipanion';
import { createConnection, type RowDataPacket } from 'mysql2/promise';
import pc from 'picocolors';
import TOML from 'smol-toml';
import t from 'typanion';
import type z from 'zod';
import { ConfigurableCommand2 } from '../util/classes.ts';

const FORMATS = ['table', 'csv', 'json', 'toml'] as const;
type OutputFormat = (typeof FORMATS)[number];

const isOutputFormat = (s: string): s is OutputFormat => FORMATS.includes(s as OutputFormat);

const TIMES = ['alltime', 'year', 'month', 'week', 'day'] as const;
const STATS = ['textMessage', 'voiceMinute', 'vote', 'invite', 'bonus'] as const;

const prefixed_times = <T extends string>(prefix: T): `${T}_${(typeof TIMES)[number]}`[] =>
  TIMES.map((time) => `${prefix}_${time}` as const);

/**
 * # Categories
 * * `xp`
 * * `stats`
 * * `stats_alltime`, `stats_year`, etc
 * * `textMessage`, `voiceMinute`, etc
 */
const SELECT_CATEGORIES = ['xp', 'stats', ...prefixed_times('stats'), ...STATS] as const;

/**
 * # Selects
 * * `xp_alltime`, `xp_year`, etc
 * * `textMessage_alltime`, `voiceMinute_alltime`, etc
 */
const VALID_SELECTS = [
  ...prefixed_times('xp'),
  ...STATS.flatMap((stat) => prefixed_times(stat)),
] as const;

const EXPAND_SELECTS: Record<SelectCategory, ValidSelect[]> = {
  xp: prefixed_times('xp'),
  stats: STATS.flatMap((stat) => prefixed_times(stat)),
  stats_alltime: STATS.map((stat) => `${stat}_alltime` as const),
  stats_year: STATS.map((stat) => `${stat}_year` as const),
  stats_month: STATS.map((stat) => `${stat}_month` as const),
  stats_week: STATS.map((stat) => `${stat}_week` as const),
  stats_day: STATS.map((stat) => `${stat}_day` as const),
  textMessage: prefixed_times('textMessage'),
  voiceMinute: prefixed_times('voiceMinute'),
  vote: prefixed_times('vote'),
  invite: prefixed_times('invite'),
  bonus: prefixed_times('bonus'),
};

type SelectCategory = (typeof SELECT_CATEGORIES)[number];
type ValidSelect = (typeof VALID_SELECTS)[number];
type SelectInput = SelectCategory | ValidSelect;

const isSelectCategory = (s: string): s is SelectCategory =>
  SELECT_CATEGORIES.includes(s as SelectCategory);
const isValidSelect = (s: string): s is ValidSelect => VALID_SELECTS.includes(s as ValidSelect);
const isSelectInput = (s: string): s is SelectInput => isSelectCategory(s) || isValidSelect(s);

function deduplicate<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export class ExportCommand extends ConfigurableCommand2 {
  static override paths = [['export']];
  static override usage = Command.Usage({
    category: 'Other',
    description: "Export a guild's member data.",
    details: `
      Gathers member data from the provided guild.
    `,
  });

  output = Option.String('-o,--out', {
    required: false,
    description: `The file to output the results to, or ${pc.blue('-')} for stdout.`,
  });

  format = Option.String('-f,--fmt,--format', {
    required: false,
    description:
      'The format to output the results as. Defaults to checking `--output`, or otherwise CSV.',
  });

  select = Option.Array('--select', {
    required: false,
    description: 'The values to output. Defaults to Alltime XP (xp_alltime).',
  });

  pretty = Option.Boolean('--pretty', {
    required: false,
    description: 'Prints the output as a table. Shorthand for `--format table`.',
  });

  skipOwnerCheck = Option.Boolean('-y,--yes', {
    required: false,
    description: 'Confirms that the guild owner is already known to the executor of the command.',
  });

  guildId = Option.String({ validator: t.cascade(t.isString(), t.matchesRegExp(/^\d{17,20}$/)) });

  override async execute() {
    const { keys, api } = await this.loadBaseConfig();

    const format = this.getOutputFormat();
    const selects = this.normalizeSelects(this.select ?? ['xp_alltime']);

    if (!this.skipOwnerCheck) {
      const confirm = await this.runOwnerCheck(api);
      if (!confirm || p.isCancel(confirm)) {
        p.cancel('Cancelled export.');
        return 8; // non-standard exit code
      }
    }

    let outputStream: Writable;

    if (!this.output || this.output.trim() === '-') {
      outputStream = process.stdout;
    } else {
      let filePath = this.output;
      if (filePath.startsWith('~/')) {
        filePath = filePath.replace(/^~/, os.homedir());
      }
      outputStream = createWriteStream(path.resolve(filePath));
    }

    const entries = await this.loadDatabaseEntries(this.guildId, keys, selects);

    outputStream.write(this.formatEntries(entries, format));
  }

  formatEntries(
    entries: { user_id: string; [s: string]: string | number }[],
    format: OutputFormat,
  ): string {
    switch (format) {
      case 'json':
        return JSON.stringify(entries, null, 4);
      case 'toml':
        return TOML.stringify({
          entries: entries.map(({ user_id, ...args }) => ({ user_id: BigInt(user_id), ...args })),
        });
      case 'csv':
        return [
          Object.keys(entries[0]).join(','),
          ...entries.map((entry) => Object.values(entry).join(',')),
        ].join('\n');
      case 'table':
        return this.formatTable(entries);
    }
  }

  formatTable(entries: { [s: string]: string | number }[]): string {
    const widths = entries.reduce<{ [s: string]: number }>((acc, curr) => {
      for (const key of Object.keys(curr)) {
        acc[key] = Math.max(acc[key] ?? key.length, curr[key].toLocaleString().length);
      }
      return acc;
    }, {});

    const widthLines = Object.values(widths).map((width) => '─'.repeat(width));

    const header = `┌─${widthLines.join('─┬─')}─┐`;
    const separator = `├─${widthLines.join('─┼─')}─┤`;
    const footer = `└─${widthLines.join('─┴─')}─┘`;

    const headerRow = Object.entries(widths).map(([key, width]) =>
      styleText(['bold', 'cyanBright'], key.padEnd(width)),
    );

    return [
      header,
      `│ ${headerRow.join(' │ ')} │`,
      separator,
      ...entries
        .map((row) =>
          Object.entries(row).map(([key, value]) => value.toString().padEnd(widths[key])),
        )
        .map((row) => `│ ${row.join(' │ ')} │`),
      footer,
    ].join('\n');
  }

  getOutputFormat(): OutputFormat {
    /*
      Priority:
      1) --format
      2) --pretty
      3) parse extension of --output file
      4) default to CSV
    */
    if (this.format) {
      const lower = this.format.toLowerCase();
      if (isOutputFormat(lower)) {
        return lower;
      }
      const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
      const supportedFormats = formatter.format(FORMATS.map(pc.blue));
      throw new UsageError(
        `Format "${pc.red(this.format)}" is not supported. Supported formats: ${supportedFormats}.`,
      );
    }

    if (this.pretty) {
      return 'table';
    }

    if (!this.output || this.output.trim() === '-') {
      return 'csv';
    }

    const outputParts = this.output.split('.');
    // no extension or .txt: table format
    if (outputParts.length < 2 || outputParts.at(-1) === 'txt') {
      return 'table';
    }
    if (outputParts.at(-1) === 'csv') {
      return 'csv';
    }
    if (outputParts.at(-1) === 'toml') {
      return 'toml';
    }
    if (outputParts.at(-1) === 'json') {
      return 'json';
    }

    return 'csv';
  }

  async runOwnerCheck(api: API): Promise<boolean | symbol> {
    const guildData = await api.guilds.get(this.guildId, { with_counts: true }).catch(() => null);
    if (!guildData) {
      p.log.warn('The bot is not currently in the selected guild.');
      return await p.confirm({
        message: 'Are you sure you want to continue this export?',
        initialValue: false,
      });
    }

    p.log.info(
      `Selected Guild: ${pc.blueBright(guildData.name)} (${guildData.approximate_member_count} members)`,
    );

    const ownerData = await api.users.get(guildData.owner_id).catch(() => null);
    if (!ownerData) {
      p.log.warn('Failed to fetch guild owner.');
      return await p.confirm({
        message: 'Are you sure you want to continue this export?',
        initialValue: false,
      });
    }

    p.log.info(
      `Guild Owner: ${styleText('blueBright', ownerData.username)} (${styleText('dim', ownerData.id)})`,
    );
    p.log.warn(
      styleText(
        ['bold', 'yellow'],
        'Do not disclose the data produced by this command to anyone except the Guild Owner listed above.',
      ),
    );

    return await p.confirm({
      message: 'Are you sure you want to continue this export?',
      initialValue: true,
    });
  }

  async getDatabaseHost(guildId: string, keys: z.infer<typeof schemas.bot.keys>): Promise<string> {
    const manager = await createConnection({
      host: keys.managerHost,
      user: keys.managerDb.dbUser,
      password: keys.managerDb.dbPassword,
      database: keys.managerDb.dbName,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });

    const hosts = (await manager.execute(
      'SELECT `host` FROM `guildRoute` LEFT JOIN `dbShard` ON `guildRoute`.`dbShardId` = `dbShard`.`id` WHERE `guildId` = ?',
      [guildId],
    )) as RowDataPacket[];
    await manager.end();

    if (hosts.length < 1 || hosts[0].length < 1) {
      p.log.error('Failed to find guild in Manager DB.');
      p.cancel();
      throw new Error('Failed to find guild in Manager DB');
    }

    return hosts[0][0].host;
  }

  normalizeSelects(selects: string[]): ValidSelect[] {
    const invalid = deduplicate(selects).filter((sel) => !isSelectInput(sel));

    if (invalid.length > 0) {
      const orFmt = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' });
      const andFmt = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

      const formattedInvalid = orFmt.format(invalid.map((val) => `"${styleText('red', val)}"`));
      const supportedSelects = andFmt.format([
        ...SELECT_CATEGORIES.map((val) => styleText(['bold', 'blue'], val)),
        ...VALID_SELECTS.map((val) => styleText('blue', val)),
      ]);

      throw new UsageError(
        `Cannot select value${invalid.length > 1 ? 's' : ''} ${formattedInvalid}.\nSupported selectors: ${supportedSelects}.\n${styleText('dim', `${styleText('bold', 'Bold')} selectors are group selectors and select more than one of the unbolded selectors.`)}`,
      );
    }

    const resolvedSelects = deduplicate(
      selects.flatMap((sel) => {
        if (isValidSelect(sel)) {
          return [sel];
        } else if (isSelectCategory(sel)) {
          return EXPAND_SELECTS[sel];
        } else {
          return [];
        }
      }),
    );

    return resolvedSelects;
  }

  async loadDatabaseEntries(
    guildId: string,
    keys: z.infer<typeof schemas.bot.keys>,
    selects: ValidSelect[],
  ): Promise<{ user_id: string; [k: string]: string | number }[]> {
    const host = await this.getDatabaseHost(guildId, keys);

    const shard = await createConnection({
      host,
      user: keys.shardDb.dbUser,
      password: keys.shardDb.dbPassword,
      database: keys.shardDb.dbName,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });

    const selectors = selects.map((sel) => {
      if (sel.startsWith('xp_')) {
        return {
          table: 'guildMember',
          select: sel.split('_')[1],
          as: sel,
          sum: false,
          coalesce: false,
        };
      } else {
        const [table, select] = sel.split('_');
        const isSumTable = table === 'textMessage' || table === 'voiceMinute';
        return { table, select, as: sel, sum: isSumTable, coalesce: true };
      }
    });

    const formattedSelectors = selectors.map((sel) => {
      let v = `${sel.table}.${sel.select}`;
      if (sel.sum) {
        v = `SUM(${v})`;
      }
      if (sel.coalesce) {
        v = `COALESCE(${v}, 0)`;
      }
      v = `${v} AS ${sel.as}`;
      return v;
    });

    const joins = deduplicate(selectors.map((sel) => sel.table))
      .filter((tab) => tab !== 'guildMember')
      .map(
        (tab) =>
          `LEFT JOIN ${tab} ON guildMember.userId = ${tab}.userId AND guildMember.guildId = ${tab}.guildId`,
      );

    const query = `SELECT ${['guildMember.userId AS user_id', ...formattedSelectors].join(', ')} FROM guildMember ${joins.join(' ')} WHERE guildMember.guildId = ? GROUP BY guildMember.userId, guildMember.guildId`;

    /*
    Example query:

    SELECT
      guildMember.userId,
      guildMember.alltime AS xp_alltime,
      COALESCE(SUM(textMessage.alltime), 0) AS textMessage_alltime,
      COALESCE(vote.alltime, 0) AS vote_alltime
    FROM guildMember
    LEFT JOIN textMessage
      ON guildMember.userId = textMessage.userId
      AND guildMember.guildId = textMessage.guildId
    LEFT JOIN vote
      ON guildMember.userId = vote.userId
      AND guildMember.guildId = vote.guildId
    WHERE guildMember.guildId = ?
    GROUP BY guildMember.userId, guildMember.guildId;
    */

    const data = await shard.execute(query, [guildId]);
    await shard.end();

    return data[0] as { user_id: string; [k: string]: string | number }[];
  }
}
