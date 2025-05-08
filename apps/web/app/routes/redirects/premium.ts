import { redirect } from 'react-router';

export async function loader() {
  return redirect('https://www.patreon.com/join/rapha01', 301);
}
