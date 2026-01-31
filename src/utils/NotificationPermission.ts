const NotificationPermission = async () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
      if (permission === "granted") {
        console.log("Permission granted!");
      } else {
        console.log("Permission denied.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }
  return null;
};
export default NotificationPermission;
