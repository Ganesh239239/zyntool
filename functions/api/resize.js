import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon";

export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const file = formData.get('image');
        const width = parseInt(formData.get('width') || '800');
        const height = parseInt(formData.get('height') || '600');

        if (!file) {
            return new Response('No image provided', { status: 400 });
        }

        const inputBytes = new Uint8Array(await file.arrayBuffer());
        const inputImage = PhotonImage.new_from_byteslice(inputBytes);
        const outputImage = resize(inputImage, width, height, SamplingFilter.Lanczos3);
        const outputBytes = outputImage.get_bytes_webp();

        inputImage.free();
        outputImage.free();

        return new Response(outputBytes, {
            headers: {
                'Content-Type': 'image/webp',
                'Content-Disposition': 'attachment; filename="resized.webp"',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
