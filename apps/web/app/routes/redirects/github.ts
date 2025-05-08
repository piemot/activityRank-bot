import { redirect } from 'react-router';

export async function loader() {
  return redirect('https://github.com/rapha01/activityRank-bot', 301);
}
