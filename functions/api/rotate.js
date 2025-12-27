import { PhotonImage, rotate, RotateMode } from "@cf-wasm/photon";

export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const file = formData.get('image');
        const angle = parseInt(formData.get('angle') || '90');

        if (!file) {
            return new Response('No image provided', { status: 400 });
        }

        const inputBytes = new Uint8Array(await file.arrayBuffer());
        const inputImage = PhotonImage.new_from_byteslice(inputBytes);

        // Rotate image (90, 180, or 270 degrees)
        let rotateMode;
        switch(angle) {
            case 90: rotateMode = RotateMode.Clockwise; break;
            case 180: rotateMode = RotateMode.HalfTurn; break;
            case 270: rotateMode = RotateMode.Anticlockwise; break;
            default: rotateMode = RotateMode.Clockwise;
        }

        const outputImage = rotate(inputImage, rotateMode);
        const outputBytes = outputImage.get_bytes_webp();

        inputImage.free();
        outputImage.free();

        return new Response(outputBytes, {
            headers: {
                'Content-Type': 'image/webp',
                'Content-Disposition': `attachment; filename="rotated-${angle}.webp"`,
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
