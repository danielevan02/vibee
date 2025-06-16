import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from ".";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
