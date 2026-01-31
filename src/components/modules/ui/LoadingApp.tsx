import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Lottie Dynamic Load without SSR
const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

const LoadingApp = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/appLoader.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  return (
    <div className="fixed bg-leftBarBg h-screen size-full flex-center">
      {animationData && (
        <Lottie
          loop
          play
          animationData={animationData}
          className="player size-85"
        />
      )}
    </div>
  );
};

export default LoadingApp;
