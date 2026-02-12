/**
 * 二维码生成工具
 */
// @ts-ignore
import qrcode from 'qrcode-generator';

/**
 * 生成二维码 SVG 字符串
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
    const typeNumber = 0; // 自动检测
    const errorCorrectionLevel = 'M';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(text);
    qr.make();

    // 返回 SVG 标签内容 (cell 宽, margin 宽)
    return qr.createSvgTag(5, 2);
}

/**
 * 生成二维码 Data URL（Base64）
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
    const typeNumber = 0;
    const errorCorrectionLevel = 'M';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(text);
    qr.make();

    // 返回 base64 数据链接
    return qr.createDataURL(5, 2);
}
