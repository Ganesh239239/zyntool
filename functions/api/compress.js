import { PhotonImage } from "@cf-wasm/photon";

export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const file = formData.get('image');
        const quality = parseInt(formData.get('quality') || '80');

        if (!file) {
            return new Response('No image provided', { 
                status: 400,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Convert file to byte array
        const inputBytes = new Uint8Array(await file.arrayBuffer());

        // Load image using Photon
        const inputImage = PhotonImage.new_from_byteslice(inputBytes);

        // Get compressed JPEG bytes
        const outputBytes = inputImage.get_bytes_jpeg(quality);

        // Free memory
        inputImage.free();

        return new Response(outputBytes, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition': 'attachment; filename="compressed.jpg"',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Compression error:', error);
        return new Response(`Error: ${error.message}`, { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
