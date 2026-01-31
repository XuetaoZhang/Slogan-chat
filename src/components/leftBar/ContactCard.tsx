import Room from "@/models/room";
import User from "@/models/user";
import Image from "next/image";
import { useMemo } from "react";
import { MdDone } from "react-icons/md";
import ProfileGradients from "../modules/ProfileGradients";

type ContactCardProps = {
  updateSelectedUsers: (id: string) => void;
  userData: Room;
  isUserOnline: boolean;
  selectedUsers: string[];
  myID: string;
};

const ContactCard = ({
  updateSelectedUsers,
  userData,
  isUserOnline,
  selectedUsers,
  myID,
}: ContactCardProps) => {
  const { name, _id, avatar } = useMemo(() => {
    return (
      ((userData.participants as User[]).find(
        (pd) => pd._id !== myID
      ) as User) || ""
    );
  }, [myID, userData.participants]);

  return (
    <div onClick={() => updateSelectedUsers(_id)}>
      <div className="flex items-center gap-2 relative cursor-pointer hover:bg-white/5 px-1 border-b border-black/15 transition-all duration-200">
        {avatar ? (
          <Image
            src={avatar}
            className="cursor-pointer object-cover size-11 rounded-full shrink-0"
            width={45}
            height={45}
            alt="avatar"
          />
        ) : (
          <ProfileGradients classNames="size-11 text-center text-lg" id={_id}>
            {name![0]}
          </ProfileGradients>
        )}
        <div className="flex flex-col justify-between  w-full py-2.5 ">
          <p className="text-base font-vazirBold line-clamp-1 text-ellipsis">
            {name}
          </p>

          <p className="text-sm text-darkGray">
            {isUserOnline ? (
              <span className="text-lightBlue">Online</span>
            ) : (
              "last seen recently"
            )}
          </p>
        </div>

        {selectedUsers.includes(_id) && (
          <span
            data-aos="zoom-in"
            className="absolute flex-center right-3 size-6 rounded-full bg-green-700"
          >
            <MdDone size={18} />
          </span>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
