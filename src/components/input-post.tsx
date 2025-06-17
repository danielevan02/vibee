"use client";

import Image from "next/image";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImagePlus, Loader, X } from "lucide-react";
import { User } from "@prisma/client";
import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadThing/helpers";
import { createPost } from "@/actions/post.action";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function InputPost({ user }: { user?: User }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("imageUploader");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState("");
  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFile(undefined);
      setPreviewUrl("");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let messageRes, statusRes;
      if (file) {
        const res = await startUpload([file]);
        const {message, status} = await createPost({
          content,
          imageUrl: res?.[0].ufsUrl
        })
        messageRes = message;
        statusRes = status;
      } else {
        const {message, status} = await createPost({
          content,
        })
        messageRes = message;
        statusRes = status;
      }
      
      if(statusRes === 201){
        setContent("")
        setFile(undefined)
        setPreviewUrl("")
        toast.success(messageRes)
      } else {
        toast.error(messageRes)
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed creating post!");
    }
  };
  return (
    <div className="rounded-md border p-5 flex flex-col sticky top-0 left-0">
      <div className="flex gap-2">
        <Image
          src={user?.photo || "/user-placeholder.png"}
          height={30}
          width={30}
          alt="User Icon"
          className="rounded-full w-fit h-fit"
        />
        <div className="flex flex-col w-full">
          <Textarea
            className="placeholder:text-neutral-400 focus-visible:ring-0 border-none resize-none min-h-20"
            placeholder="What's happening?"
            disabled={loading}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                key={previewUrl}
                className="relative w-[40%]"
                initial={{ y: 100, opacity: 0 }} // Kondisi awal (kecil dan transparan)
                animate={{ y: 0, opacity: 1 }} // Kondisi saat masuk/muncul (ukuran dan opacity normal)
                exit={{ y: 100, opacity: 0 }} // Kondisi saat keluar/hilang (kembali kecil dan transparan)
                transition={{ duration: 0.3 }} // Durasi animasi
              >
                <Image
                  src={previewUrl}
                  alt="Photo"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  className={cn("p-1 bg-red-600 rounded-full text-white absolute -top-2 -right-2 cursor-pointer transition hover:bg-red-400", loading && 'hidden')}
                  disabled={loading}
                  onClick={() => {
                    setFile(undefined);
                    setPreviewUrl("");
                  }}
                >
                  <X className="w-4 h-4 " />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <hr className="my-5" />

      <div className="flex justify-between items-center">
        {/* HIDDEN */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          variant="ghost"
          onClick={handleButtonClick}
          className="cursor-pointer"
          disabled={loading}
        >
          <ImagePlus className="text-primary" />
        </Button>

        <Button className="font-bold" onClick={handleSubmit}>
          {loading ? <Loader className="animate-spin" /> : <span>Post</span>}
        </Button>
      </div>
    </div>
  );
}
