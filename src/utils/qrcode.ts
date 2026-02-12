/**
 * 二维码生成工具
 */
import QRCode from 'qrcode';

/**
 * 生成二维码 SVG 字符串
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
    return QRCode.toString(text, {
        type: 'svg',
        margin: 2,
        width: 200,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    });
}

/**
 * 生成二维码 Data URL（Base64）
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
        margin: 2,
        width: 200,
    });
}
