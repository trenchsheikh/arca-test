import { redirect } from 'next/navigation';

/** Legacy investor entry — Figma dashboard lives at /investor */
export default function DashboardRedirectPage() {
  redirect('/investor');
}
