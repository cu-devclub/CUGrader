import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

// useDropzone dont provide a method to remove files, so i wrap it
// TODO: rename this
export function useDropzoneFrFr() {
  const { acceptedFiles, inputRef, ...rest } = useDropzone({});

  // i hate react
  const [files, setFiles] = useState(acceptedFiles);
  useEffect(() => {
    setFiles(acceptedFiles);
  }, [acceptedFiles.length]);

  const hasFile = files.length > 0;

  const removeFiles = useMemo(() => () => {
    // console.log(inputRef.current.value);
    setFiles([]);
    inputRef.current.value = ""; // bruh
  }, [inputRef]);

  return {
    ...rest,
    hasFile,
    removeFiles,
    inputRef,
    files
  };
}

