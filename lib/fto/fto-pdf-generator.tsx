
import path from "path";
import fs from "fs";
import { renderToBuffer } from "@react-pdf/renderer";

import FtoPdfTemplate, {
  type FtoPdfData,
} from "./fto-pdf-template";

export async function generateFtoPdf(
  data: FtoPdfData
): Promise<Buffer> {
  const headerImagePath = path.join(
    process.cwd(),
    "public",
    "nleta-fto-header.png"
  );

  if (!fs.existsSync(headerImagePath)) {
    throw new Error(
      "NLETA FTO header image not found in public folder."
    );
  }

  // Embed the header image as Base64 to ensure React PDF loads it.
  const imageBuffer = fs.readFileSync(headerImagePath);
  const headerImageData = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  const pdfBuffer = await renderToBuffer(
    <FtoPdfTemplate
      data={data}
      headerImagePath={headerImageData}
    />
  );

  return Buffer.from(pdfBuffer);
}
