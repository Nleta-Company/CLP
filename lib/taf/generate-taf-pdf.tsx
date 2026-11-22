import path from "path";
import fs from "fs";
import { renderToBuffer } from "@react-pdf/renderer";

import TafPdfTemplate, { type TafPdfData } from "./taf-pdf-template";

export async function generateTafPdf(data: TafPdfData): Promise<Buffer> {
  const headerImagePath = path.join(process.cwd(), "public", "nleta-fto-header.png");

  if (!fs.existsSync(headerImagePath)) {
    throw new Error("NLETA TAF header image not found in public folder.");
  }

  const imageBuffer = fs.readFileSync(headerImagePath);
  const headerImageData = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  const pdfBuffer = await renderToBuffer(
    <TafPdfTemplate data={data} headerImageData={headerImageData} />
  );

  return Buffer.from(pdfBuffer);
}
