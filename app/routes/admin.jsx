import { Form, Outlet, useLoaderData } from '@remix-run/react';
import bcrypt from 'bcryptjs';
import { prisma } from '~/db.server';
import { getSession, getUsername, setSession } from '~/cookie.server';

async function isAuthed(request) {
  const username = await getUsername(request);
  if (!username) return false;
  const user = await prisma.admin.findFirst({ where: { username } });
  return !!user; // TODO
}

export async function loader({ request }) {
  return { authed: await isAuthed(request) };
}

export async function action({ request }) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');
  const session = await getSession(request);
  const admin = await prisma.admin.findFirst({
    where: {
      username,
    },
  });

  if (!admin) {
    throw new Response(undefined, { status: 401 });
  }
  const passwordIsValid = await bcrypt.compare(password, admin.password);
  if (!passwordIsValid) {
    throw new Response(undefined, { status: 401 });
  }

  session.set('username', username);
  return new Response(undefined, {
    status: 200,
    headers: {
      'Set-Cookie': await setSession({ session }),
    },
  });
}

export default function AdminPage() {
  const { authed } = useLoaderData();
  if (authed) {
    return <Outlet />;
  }
  return (
    <Form method="post">
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">go</button>
    </Form>
  );
}
