import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ChannelType,
  InteractionContextType,
  PermissionFlagsBits,
} from 'discord-api-types/v10';
import { z } from 'zod/v4';

function canParseBigInt(val: string): boolean {
  try {
    BigInt(val);
    return true;
  } catch {
    return false;
  }
}

/**
 * Takes a key or value from an int enum, and returns the value
 *
 * @example
 * enum Color {
 *   Red = 1,
 *   Green = 2,
 * }
 *
 * toIntEnumValue(Color)("Red")   // 1
 * toIntEnumValue(Color)(1)       // 1
 * toIntEnumValue(Color)("Green") // 2
 */
function toIntEnumValue<T extends Record<string, string | number>>(
  enumObject: T,
): (keyOrValue: string | number) => number | undefined {
  return (keyOrValue) => {
    if (typeof keyOrValue === 'number' && enumObject[keyOrValue] !== undefined) {
      return keyOrValue;
    }

    const value = enumObject[keyOrValue];
    return typeof value === 'number' ? value : undefined;
  };
}

/**
 * A validator that accepts either a key or a value of an enum.
 * @example
 *
 * enum Color {
 *   Red = 1,
 *   Green = 2,
 * }
 *
 * preprocessEnum(Color).parse("Red")     // 1
 * preprocessEnum(Color).parse(1)         // 1
 * preprocessEnum(Color).parse(Color.Red) // 1
 * preprocessEnum(Color).parse("Blue")    // fails
 * preprocessEnum(Color).parse(3)         // fails
 */
function preprocessEnum<A extends Record<string, string | number>>(enumObject: A) {
  return z.preprocess(toIntEnumValue(enumObject), z.enum(enumObject));
}

function enumKeyOrValue<A extends Record<string, string | number>, V extends A[keyof A]>(
  enumObject: A,
  value: V,
) {
  const key = enumObject[value as keyof A];
  return z.union([z.literal(key), z.literal(value)]).transform(() => value);
}

const default_member_permissions = z.preprocess((val) => {
  if (Array.isArray(val)) {
    if (val.length < 1) {
      return null;
    }
    if (val.every(canParseBigInt)) {
      return val
        .map((permission) => BigInt(permission))
        .reduce((last, curr) => last | curr, 0n)
        .toString();
    }
    if (val.every((permission) => Object.keys(PermissionFlagsBits).includes(permission))) {
      return val
        .map((permission) => PermissionFlagsBits[permission as keyof typeof PermissionFlagsBits])
        .reduce((last, curr) => last | curr, 0n)
        .toString();
    }
    return val;
  }
  return val;
}, z
  .string()
  .refine(canParseBigInt, { message: 'default_member_permissions must be parseable to a BigInt.' })
  .nullable());

const NAME_REGEX = /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;
const baseOptionSchema = z.object({
  name: z.string().regex(NAME_REGEX),
  // check `description` in translations
  required: z.boolean().optional().default(false),
});

const choiceSchema = <T extends z.ZodTypeAny>(t: T) =>
  z.array(z.object({ name: z.string().min(1).max(100), value: t })).max(25);

export const basicOptionSchema = z.discriminatedUnion('type', [
  baseOptionSchema.extend({
    type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Boolean),
  }),
  baseOptionSchema.extend({
    type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.User),
  }),
  baseOptionSchema.extend({
    type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Role),
  }),
  baseOptionSchema.extend({
    type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Mentionable),
  }),
  baseOptionSchema.extend({
    type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Attachment),
  }),
  baseOptionSchema.extend({
    type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Channel),
    channel_types: z.array(preprocessEnum(ChannelType)).optional(),
  }),
  z.discriminatedUnion('autocomplete', [
    baseOptionSchema.extend({
      type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.String),
      min_length: z.number().int().min(0).max(6000).optional(),
      max_length: z.number().int().min(1).max(6000).optional(),
      autocomplete: z.literal(true),
    }),
    baseOptionSchema.extend({
      type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.String),
      min_length: z.number().int().min(0).max(6000).optional(),
      max_length: z.number().int().min(1).max(6000).optional(),
      autocomplete: z.literal(false).optional(),
      choices: choiceSchema(z.string().min(1).max(100)).optional(),
    }),
  ]),
  z.discriminatedUnion('autocomplete', [
    baseOptionSchema.extend({
      type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Integer),
      min_value: z.number().int().optional(),
      max_value: z.number().int().optional(),
      autocomplete: z.literal(true),
    }),
    baseOptionSchema.extend({
      type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Integer),
      min_value: z.number().int().optional(),
      max_value: z.number().int().optional(),
      autocomplete: z.literal(false).optional(),
      choices: choiceSchema(z.number().int()).optional(),
    }),
  ]),
  z.discriminatedUnion('autocomplete', [
    baseOptionSchema.extend({
      type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Number),
      min_value: z.number().optional(),
      max_value: z.number().optional(),
      autocomplete: z.literal(true),
    }),
    baseOptionSchema.extend({
      type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Number),
      min_value: z.number().optional(),
      max_value: z.number().optional(),
      autocomplete: z.literal(false).optional(),
      choices: choiceSchema(z.number()).optional(),
    }),
  ]),
]);

export const subcommandOptionSchema = baseOptionSchema.extend({
  type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.Subcommand),
  options: z.array(basicOptionSchema).min(1).max(25).optional(),
});

export const subcommandGroupOptionSchema = baseOptionSchema.extend({
  type: enumKeyOrValue(ApplicationCommandOptionType, ApplicationCommandOptionType.SubcommandGroup),
  options: z.array(subcommandOptionSchema).min(1).max(25),
});

export const chatInputCommandSchema = z.object({
  name: z.string().regex(NAME_REGEX),
  // check `description` in translations
  type: enumKeyOrValue(ApplicationCommandType, ApplicationCommandType.ChatInput),
  default_member_permissions,
  integration_types: z
    .array(
      z.preprocess(toIntEnumValue(ApplicationIntegrationType), z.enum(ApplicationIntegrationType)),
    )
    .optional(),
  contexts: z
    .array(z.preprocess(toIntEnumValue(InteractionContextType), z.enum(InteractionContextType)))
    .optional(),
  options: z
    .union([
      z.array(basicOptionSchema).min(0).max(25),
      z
        .array(z.union([subcommandOptionSchema, subcommandGroupOptionSchema]))
        .min(0)
        .max(25),
    ])
    .optional(),
});

export const contextCommandSchema = z.object({
  name: z.string().min(1).max(32),
  // check `description` in translations
  type: z.union([
    enumKeyOrValue(ApplicationCommandType, ApplicationCommandType.Message),
    enumKeyOrValue(ApplicationCommandType, ApplicationCommandType.User),
  ]),
  default_member_permissions,
  integration_types: z.array(z.enum(ApplicationIntegrationType)).optional(),
  contexts: z
    .array(z.preprocess(toIntEnumValue(InteractionContextType), z.enum(InteractionContextType)))
    .optional(),
});

/** Defines the behaviour of where commands are deployed. */
export const Deploy = {
  /** This command can only be deployed manually. */
  Never: 'NEVER',
  /** This command will be ignored when deploying globally. */
  LocalOnly: 'LOCAL_ONLY',
  /** This command can be automatically deployed to any and all guilds. */
  Global: 'GLOBAL',
} as const;

export type DeploymentMode = (typeof Deploy)[keyof typeof Deploy];

const commandExtension = {
  deployment: z.enum([Deploy.Never, Deploy.LocalOnly, Deploy.Global]).optional(),
};

export const commandsSchema = z.array(
  z.discriminatedUnion('type', [
    chatInputCommandSchema.extend(commandExtension),
    contextCommandSchema.extend(commandExtension),
  ]),
);
