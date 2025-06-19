import { useEffect, useMemo, useState } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";

// useDropzone dont provide a method to remove files, so i wrap it
export function useDropzoneFrFr(options?: DropzoneOptions) {
  const { acceptedFiles, inputRef, ...rest } = useDropzone(options);

  // i hate react
  const [files, setFiles] = useState(acceptedFiles);
  useEffect(() => {
    if (acceptedFiles) {
      const c = [...files, ...Array.from(acceptedFiles)];
      setFiles([...new Set(c)]);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }

  }, [acceptedFiles.length]);



  const hasFile = files.length > 0;

  const removeFiles = () => {
    // console.log(inputRef.current.value);
    setFiles([]);
    inputRef.current.value = ""; // bruh
  };

  const removeFile = (index: number) => {
    setFiles(files.toSpliced(index, 1));
  };

  return {
    ...rest,
    hasFile,
    removeFiles,
    removeFile,
    inputRef,
    files
  };
}

