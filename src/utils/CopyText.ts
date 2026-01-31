import toaster from "./Toaster";

const copyText = async (text: string) => {
  if ("clipboard" in navigator) {
    await navigator.clipboard.writeText(text);
  } else {
    toaster("error", "Copy not supported in your browser.");
  }
};

export default copyText;
