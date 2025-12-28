export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Image worker ready", { status: 200 });
  }
};
