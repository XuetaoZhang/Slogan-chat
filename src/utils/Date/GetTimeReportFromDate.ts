const getTimeReportFromDate = (date: string | null) => {
  if (!date) return null;

  const now = new Date();
  const messageDate = new Date(date);

  if (isNaN(messageDate.getTime())) return null;

  const timeDiff = now.getTime() - messageDate.getTime();
  const secondsInMinutes = 60;
  const secondsInHours = secondsInMinutes * 60;
  const secondsInDays = secondsInHours * 24;
  const secondsInMonths = secondsInDays * 30;
  const secondsInYears = secondsInDays * 365;

  const diffInSeconds = Math.floor(timeDiff / 1000);

  if (diffInSeconds < secondsInMinutes) {
    return "Just now";
  } else if (diffInSeconds < secondsInHours) {
    const minutes = Math.floor(diffInSeconds / secondsInMinutes);
    return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
  } else if (diffInSeconds < secondsInDays) {
    const hours = Math.floor(diffInSeconds / secondsInHours);
    return hours + (hours === 1 ? " hour ago" : " hours ago");
  } else if (diffInSeconds < secondsInMonths) {
    const days = Math.floor(diffInSeconds / secondsInDays);
    return days + (days === 1 ? " day ago" : " days ago");
  } else if (diffInSeconds < secondsInYears) {
    const months = Math.floor(diffInSeconds / secondsInMonths);
    return months + (months === 1 ? " month ago" : " months ago");
  } else {
    const years = Math.floor(diffInSeconds / secondsInYears);
    return years + (years === 1 ? " year ago" : " years ago");
  }
};

export default getTimeReportFromDate;
