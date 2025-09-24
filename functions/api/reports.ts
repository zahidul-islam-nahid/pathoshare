export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ env }) => {
	const { results } = await env.DB.prepare("SELECT json FROM reports ORDER BY updated_at DESC").all();
	const items = (results || []).map((r: any) => JSON.parse(r.json));
	return new Response(JSON.stringify(items), { headers: { 'content-type': 'application/json' } });
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
	try {
		const report = await request.json();
		if (!report?.id) return new Response('Missing id', { status: 400 });
		const now = new Date().toISOString();
		await env.DB.prepare("INSERT INTO reports (id, json, created_at, updated_at) VALUES (?, ?, ?, ?)")
			.bind(report.id, JSON.stringify(report), now, now)
			.run();
		return new Response(JSON.stringify(report), { headers: { 'content-type': 'application/json' }, status: 201 });
	} catch (e: any) {
		return new Response(e?.message || 'Bad Request', { status: 400 });
	}
};


