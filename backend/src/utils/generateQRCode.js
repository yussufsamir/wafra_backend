import QRCode from "qrcode";

export const generateQRCode = async (data) => {
  try {
    // Convert to string (safe for objects too)
    const qrData = typeof data === "string" ? data : JSON.stringify(data);

    const qr = await QRCode.toDataURL(qrData);

    return qr;
  } catch (err) {
    throw new Error("Failed to generate QR code");
  }
};