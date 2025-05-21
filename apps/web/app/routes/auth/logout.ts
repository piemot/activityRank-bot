import type { Route } from './+types/logout';
import { redirect } from 'react-router';
import { getDeleteSessionCookieHeaders, getSessionId, invalidateSession } from '~/lib/session';
import { getCanonicalUrl, resolveCanonicalUrl } from '~/lib/util';

export async function action({ request, params }: Route.ActionArgs) {
  let url = params.redirect ? new URL(params.redirect, resolveCanonicalUrl()) : null;
  // Prevent open redirect vulnerability (https://thecopenhagenbook.com/open-redirect).
  // If this isn't done, `params.redirect` could be set to `https://scam.me` and would
  // therefore cause an open redirect vulnerability.
  // Parsing the URL like this allows for both relative and absolute paths to be provided,
  // as long as they are relative to the root.
  if (url?.hostname !== getCanonicalUrl().hostname) {
    url = null;
  }

  const id = getSessionId(request);
  if (id) {
    await invalidateSession(id);
    const headers = getDeleteSessionCookieHeaders();
    return redirect(url ? url.toString() : '/', { headers });
  }
  return new Response(null, { status: 401 });
}
