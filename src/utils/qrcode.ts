/**
 * 二维码生成工具 - 占位版 (Edge Runtime 兼容性排查)
 */

export async function generateQRCodeSVG(text: string): Promise<string> {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text x="50" y="50" text-anchor="middle" dy=".3em" font-size="10">QR Placeholder</text>
    </svg>`;
}

export async function generateQRCodeDataURL(text: string): Promise<string> {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}
