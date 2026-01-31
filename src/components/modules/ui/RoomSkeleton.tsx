const RoomSkeleton = () => {
  return (
    <div className="flex gap-3 flex-col overflow-hidden">
      {Array(15)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 py-2 px-2 border-b border-black/10"
          >
            <div className="flex w-[95%] items-center gap-3">
              <div className="skeleton size-12 bg-black/50 shrink-0 rounded-full"></div>
              <div className="flex w-full flex-col gap-4">
                <div className="skeleton bg-black/50 h-4 w-24"></div>
                <div className="skeleton bg-black/50 h-4 w-full"></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default RoomSkeleton;
