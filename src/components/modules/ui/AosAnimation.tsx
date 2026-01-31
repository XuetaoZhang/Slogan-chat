"use client";
import useGlobalStore from "@/stores/globalStore";
import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";

const AosAnimation = () => {
  const selectedRoom = useGlobalStore((state) => state.selectedRoom);

  useEffect(() => {
    Aos.init({ once: true, duration: 300 });
  }, []);

  useEffect(() => {
    Aos.refresh();
  }, [selectedRoom?._id]);

  return null;
};

export default AosAnimation;
