import { createCookieSessionStorage } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_admin_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getSession(request) {
return await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
}

export async function getUsername(request) {
  const session = await getSession(request)
  const username = session.get('username');
  return username;
}

export async function setSession({ session }) {
  return await sessionStorage.commitSession(session)
}

export async function removeSession({ session }) {
  return await sessionStorage.destroySession(session)
}
