import { redirect } from 'next/navigation';

/** Old Discover route — bookmarks and next.config also redirect to home. */
export default function DiscoverPage() {
  redirect('/');
}
