import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { TbDownload } from "react-icons/tb";

interface ProfileImageViewerProps {
  imageUrl: string;
  onClose: () => void;
  onDelete?: () => void;
}

const ProfileImageViewer = ({ imageUrl, onClose }: ProfileImageViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  // Zoom control with the mouse wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setScale((prev) => {
        const newScale = prev + delta;
        return newScale < 0.5 ? 0.5 : newScale > 3 ? 3 : newScale;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex-center z-50"
      ref={containerRef}
    >
      <div className="relative">
        <Image
          src={imageUrl}
          alt="Profile"
          className="max-w-full max-h-screen select-none rounded-sm"
          width={500}
          height={500}
          style={{
            transform: `scale(${scale}) translate(${0 / scale}px, ${
              0 / scale
            }px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Downloadn btn */}
      <a
        href={imageUrl}
        download
        className="absolute top-4 right-16  rounded-full p-2 cursor-pointer hover:bg-gray-800 focus:outline-none"
      >
        <TbDownload className="size-5 text-white" />
      </a>

      {/* Close btn */}
      {onClose && (
        <button
          className="absolute top-4 right-4  rounded-full p-2 cursor-pointer hover:bg-gray-800 focus:outline-none"
          onClick={onClose}
        >
          <CgClose className="size-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default ProfileImageViewer;
