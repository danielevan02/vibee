import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "@/server/services/uploadthing";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
