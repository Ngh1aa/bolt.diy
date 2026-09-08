import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

type SearchResult = {
  title: string;
  url: string;
  description: string;
  age?: string;
  favicon?: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();

  if (!q) {
    return Response.json(
      { error: 'Missing q', results: [] },
      { status: 400 },
    );
  }

  const cloudflareEnv = context?.cloudflare?.env as Record<string, string> | undefined;
  const apiKey =
    cloudflareEnv?.BRAVE_SEARCH_API_KEY ||
    process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          'BRAVE_SEARCH_API_KEY is not configured. Add it to bolt.diy/.env.local and restart Bolt.',
        results: [],
      },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    q,
    count: '8',
    country: 'VN',
    search_lang: 'vi',
    safesearch: 'moderate',
  });

  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
    {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();

    return Response.json(
      {
        error: `Brave Search failed (${response.status})`,
        detail: detail.slice(0, 800),
        results: [],
      },
      { status: response.status },
    );
  }

  const data = (await response.json()) as any;

  const results: SearchResult[] = (data?.web?.results ?? [])
    .slice(0, 8)
    .map((item: any) => ({
      title: String(item?.title ?? 'Untitled result'),
      url: String(item?.url ?? ''),
      description: String(item?.description ?? ''),
      age: item?.age ? String(item.age) : undefined,
      favicon: item?.profile?.img ? String(item.profile.img) : undefined,
    }))
    .filter((item: SearchResult) => item.url);

  return Response.json({
    provider: 'brave',
    query: q,
    results,
  });
}
