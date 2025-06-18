import NotificationCard from "./notificationCard";

export default function page() {
  return (
    <div className="flex min-h-screen">
      <div className="w-full border-gray-300 flex flex-col items-center">
        <div className="w-full h-full p-4">
          <div className="flex border-b mb-4 px-10 h-12">
            <h1 className="text-2xl">Notification</h1>
          </div>
          <div className="w-full h-full px-30">
            <div className="mb-1">
              <h1>Course Notifications</h1>
            </div>
            <div className="flex flex-col item-center gap-y-2 border border-solid h-full p-2">
              <NotificationCard />
              <NotificationCard />
              <NotificationCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
