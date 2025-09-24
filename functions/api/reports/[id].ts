export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ params, env }) => {
	const id = params.id as string;
	const row = await env.DB.prepare("SELECT json FROM reports WHERE id=?").bind(id).first();
	if (!row) return new Response('Not found', { status: 404 });
	return new Response(row.json as string, { headers: { 'content-type': 'application/json' } });
};

export const onRequestPut: PagesFunction<{ DB: D1Database }> = async ({ params, request, env }) => {
	const id = params.id as string;
	const report = await request.json();
	if (!report?.id || report.id !== id) return new Response('ID mismatch', { status: 400 });
	const now = new Date().toISOString();
	const json = JSON.stringify(report);
	const res = await env.DB.prepare("UPDATE reports SET json=?, updated_at=? WHERE id=?")
		.bind(json, now, id).run();
	if ((res as any).meta?.changes === 0) return new Response('Not found', { status: 404 });
	return new Response(json, { headers: { 'content-type': 'application/json' } });
};

export const onRequestDelete: PagesFunction<{ DB: D1Database }> = async ({ params, env }) => {
	const id = params.id as string;
	const res = await env.DB.prepare("DELETE FROM reports WHERE id=?").bind(id).run();
	if ((res as any).meta?.changes === 0) return new Response('Not found', { status: 404 });
	return new Response(null, { status: 204 });
};


