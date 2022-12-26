import { redirect } from '@remix-run/node';
import { getSession, removeSession } from '~/cookie.server';

export async function action({ request }) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await removeSession({ session }),
    },
  });
}

export function loader() {
  return redirect('/');
}
