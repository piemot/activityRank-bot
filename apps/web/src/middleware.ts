import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const forbidden = () => new NextResponse('Forbidden', { status: 403 });

// This is anti-CSRF middleware: see https://thecopenhagenbook.com/csrf
export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === 'GET') {
    const response = NextResponse.next();
    const token = request.cookies.get('session')?.value ?? null;
    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure
      // a new session wasn't set when handling the request.
      response.cookies.set('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return response;
  }

  const originHeader = request.headers.get('Origin');
  // NOTE: You may need to use `X-Forwarded-Host` instead
  const hostHeader = request.headers.get('Host');
  if (originHeader === null || hostHeader === null) {
    return forbidden();
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return forbidden();
  }

  if (origin.host !== hostHeader) {
    return forbidden();
  }

  return NextResponse.next();
}
