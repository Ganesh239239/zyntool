import { PhotonImage, rotate90, rotate180, rotate270 } from "@cf-wasm/photon";

export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const file = formData.get('image');
        const angle = parseInt(formData.get('angle') || '90');

        if (!file) {
            return new Response('No image provided', { status: 400 });
        }

        const inputBytes = new Uint8Array(await file.arrayBuffer());
        let inputImage = PhotonImage.new_from_byteslice(inputBytes);

        // Rotate based on angle
        switch(angle) {
            case 90:
                inputImage = rotate90(inputImage);
                break;
            case 180:
                inputImage = rotate180(inputImage);
                break;
            case 270:
                inputImage = rotate270(inputImage);
                break;
        }

        const outputBytes = inputImage.get_bytes_webp();
        inputImage.free();

        return new Response(outputBytes, {
            headers: {
                'Content-Type': 'image/webp',
                'Content-Disposition': 'attachment; filename="rotated.webp"',
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
