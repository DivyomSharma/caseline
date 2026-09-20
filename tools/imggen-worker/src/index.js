export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const prompt = url.searchParams.get('prompt') || 'a photo';
    const model = url.searchParams.get('model') || '@cf/bytedance/stable-diffusion-xl-lightning';
    const steps = parseInt(url.searchParams.get('steps') || '8', 10);
    const secret = url.searchParams.get('key');

    if (secret !== 'caseline-imggen-2026') {
      return new Response('unauthorized', { status: 401 });
    }

    try {
      const inputs = model.includes('flux-1-schnell')
        ? { prompt, steps: Math.min(steps, 8) }
        : { prompt, num_steps: steps };

      const response = await env.AI.run(model, inputs);

      if (response instanceof ReadableStream || response instanceof Uint8Array || response instanceof ArrayBuffer) {
        return new Response(response, { headers: { 'Content-Type': 'image/png' } });
      }
      if (response && response.image) {
        const binary = atob(response.image);
        const bytes = Uint8Array.from(binary, (m) => m.codePointAt(0));
        return new Response(bytes, { headers: { 'Content-Type': 'image/jpeg' } });
      }
      return new Response(JSON.stringify(response), { status: 500 });
    } catch (err) {
      return new Response('error: ' + err.message, { status: 500 });
    }
  }
};
