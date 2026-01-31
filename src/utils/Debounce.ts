const debounce = (delay: number = 1000) => {
  let timer: NodeJS.Timeout;

  return (fn: () => void) => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
};

export default debounce;
