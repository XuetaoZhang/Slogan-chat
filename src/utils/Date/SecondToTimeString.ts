const secondsToTimeString = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedHours = hours > 0 ? hours.toString().padStart(2, "0") + ":" : "";
  const paddedMinutes = minutes.toString().padStart(2, "0") + ":";
  const paddedSeconds = secs.toString().padStart(2, "0");

  return paddedHours + paddedMinutes + paddedSeconds;
};

export default secondsToTimeString;
