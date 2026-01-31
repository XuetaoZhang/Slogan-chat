import { useEffect, useRef, useState } from "react";

const useScrollChange = (elem: HTMLElement | null) => {
  const lastScrollPosition = useRef(0);
  const [canShow, setCanShow] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (!elem) return;

    const checkScrollValue = () => {
      const scrollTop = elem.scrollTop;
      const clientHeight = elem.clientHeight;
      const scrollHeight = elem.scrollHeight;

      setCanShow(scrollTop > lastScrollPosition.current);
      lastScrollPosition.current = scrollTop;
      setScrollPosition(scrollTop);

      if (scrollTop + clientHeight >= scrollHeight - 1) {
        setCanShow(false);
      }
    };

    elem.addEventListener("scroll", checkScrollValue);

    return () => {
      elem.removeEventListener("scroll", checkScrollValue);
    };
  }, [elem]);

  return {
    lastScrollPosition: scrollPosition,
    canShow,
    setCanShow,
  };
};

export default useScrollChange;
