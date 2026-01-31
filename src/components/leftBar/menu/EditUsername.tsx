import { useEffect, useState } from "react";
import LeftBarContainer from "./LeftBarContainer";
import { MdDone } from "react-icons/md";
import axios from "axios";
import useUserStore from "@/stores/userStore";
import useSockets from "@/stores/useSockets";
import Loading from "@/components/modules/ui/Loading";

const EditUsername = ({ getBack }: { getBack: () => void }) => {
  const {
    username: currentUsername,
    _id,
    setter,
  } = useUserStore((state) => state);
  const socket = useSockets((state) => state.rooms);

  const [username, setUsername] = useState(currentUsername);

  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isValidationLoading, setIsValidationLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const updateUsername = () => {
    setIsLoading(true);

    socket?.emit("updateUserData", {
      userID: _id,
      username,
    });

    socket?.on("updateUserData", () => {
      setTimeout(() => {
        setIsLoading(false);
        setter({ username });
        getBack();
      }, 500);
    });
  };

  useEffect(() => {
    if (username.trim() === currentUsername) return;

    setIsValidationLoading(true);

    const debounceSearch = async () => {
      const updatedUsername = username.trim().toLowerCase();
      setIsValidationLoading(true);

      try {
        const { data } = await axios.post("/api/users/updateUsername", {
          query: updatedUsername,
        });
        setIsUsernameValid(data?.isValid);
        setErrorMsg(data?.message);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setIsUsernameValid(false);
        setErrorMsg(error?.response?.data?.message);
      } finally {
        setIsValidationLoading(false);
      }
    };

    const timer = setTimeout(debounceSearch, 1000);

    return () => {
      setIsValidationLoading(false);
      clearTimeout(timer);
    };
  }, [username, currentUsername]);

  return (
    <LeftBarContainer
      getBack={getBack}
      leftHeaderChild={
        currentUsername.trim() !== username.trim() &&
        (isLoading ? (
          <Loading size="sm" classNames="absolute right-2 bg-white" />
        ) : (
          !isValidationLoading &&
          isUsernameValid && (
            <MdDone
              data-aos="zoom-right"
              onClick={updateUsername}
              className="size-6 absolute right-2 cursor-pointer"
            />
          )
        ))
      }
    >
      <div className="flex flex-col gap-2 pb-4 !w-full  px-4 text-white">
        <p className="text-darkBlue font-vazirRegular pt-1  font-bold text-base">
          Set username
        </p>
        <div className="flex">
          <span>@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            placeholder="username"
            className="outline-hidden bg-inherit w-full"
            max={22}
            maxLength={22}
          />
        </div>
      </div>

      <div className="fixed size-full text-white/55 inset-x-0 text-sm h-full bg-black/70 px-4 pt-2 break-words">
        {isValidationLoading ? (
          <p data-aos="zoom-left" className="my-2">
            Checking username...
          </p>
        ) : null}
        {currentUsername.trim() !== username.trim() && !isValidationLoading && (
          <p
            data-aos="zoom-left"
            className={`my-2 ${
              isUsernameValid ? "text-green-500" : "text-red-500"
            }`}
          >
            {isUsernameValid
              ? `${username} is available`
              : errorMsg ??
                "Username must be between 5 & 20 Characters length."}
          </p>
        )}
        You can choose a username on{" "}
        <span className="font-bold font-vazirBold">Telegram</span>. If you do,
        people will be able to find you by this username and contact you without
        needing your phone number.
        <br />
        <br /> You can use a-z, 0-9 and underscores. Minimum length is 3
        Characters.
      </div>
    </LeftBarContainer>
  );
};

export default EditUsername;
