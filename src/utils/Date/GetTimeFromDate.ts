const getTimeFromDate = (date: string | null) => {
  const time = new Date(date!).toLocaleTimeString([], {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  return time.includes("Invalid") ? null : time;
};

export default getTimeFromDate;
