import { redirect } from 'react-router';

export async function loader() {
  return redirect('https://discord.com/invite/DE3eQ8H', 301);
}
