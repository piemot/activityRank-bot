// Defines a wrapper for the react-router Cookie API so that cookies can be more strictly typed.
// It has an identical API to the react-router one, except that the `State` type parameter can be
// provided to limit the deserialized value of the cookie.

import {
  createCookie as _createCookie,
  type CookieOptions,
  type CookieParseOptions,
  type CookieSerializeOptions,
} from 'react-router';

export function createCookie<State = any>(
  name: string,
  cookieOptions?: CookieOptions,
): Cookie<State> {
  return _createCookie(name, cookieOptions);
}

export interface Cookie<State = any> {
  readonly name: string;
  readonly isSigned: boolean;
  readonly expires?: Date;
  parse(cookieHeader: string | null, options?: CookieParseOptions): Promise<State | null>;
  serialize(value: State, options?: CookieSerializeOptions): Promise<string>;
}
