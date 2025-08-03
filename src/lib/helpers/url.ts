import { goto } from '$app/navigation';

export function updateParams(newParams: Record<string, string | null>) {
  const url = new URL(window.location.href);

  for (const [key, value] of Object.entries(newParams)) {
    if (value) url.searchParams.set(key, value);
  }

  goto(url.toString());
}
