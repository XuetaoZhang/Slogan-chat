const scrollToMessage = (
  id: string,
  behavior: "smooth" | "auto" = "smooth",
  block = "start" as ScrollLogicalPosition
) => {
  const replayTargetElem = document.getElementsByClassName(id!)[0];
  if (!replayTargetElem) {
    return;
  }

  replayTargetElem?.scrollIntoView({ block, behavior });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        scrollToElem();
        observer.unobserve(replayTargetElem);
      }
    });
  });

  const scrollToElem = () => {
    replayTargetElem.classList.add("active");
    setTimeout(() => replayTargetElem.classList.remove("active"), 1000);
  };

  observer.observe(replayTargetElem);
};

export default scrollToMessage;
