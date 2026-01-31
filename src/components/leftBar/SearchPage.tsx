import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import useUserStore from "@/stores/userStore";
import Room from "@/models/room";
import SearchResultCard from "./SearchResultCard";
import User from "@/models/user";
import RoomSkeleton from "../modules/ui/RoomSkeleton";
import useGlobalStore from "@/stores/globalStore";

interface Props {
  closeSearch: () => void;
}

const SearchPage = ({ closeSearch }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<User[] | Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFinished, setSearchFinished] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const { isRoomDetailsShown } = useGlobalStore((state) => state);
  const userData = useUserStore((state) => state);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery.length) {
      setIsLoading(false);
      setSearchResult([]);
      setSearchFinished(false);
      return;
    }

    const fetchQuery = async () => {
      try {
        setSearchFinished(false);
        setIsLoading(true);
        const { data, status } = await axios.post("/api/users/find", {
          query: { userID: userData._id, payload: trimmedQuery },
        });

        if (status === 200) {
          setSearchResult(data);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        setSearchResult([]);
      } finally {
        setIsLoading(false);
        setSearchFinished(true);
      }
    };

    timer.current = setTimeout(fetchQuery, 500);
    return () => {
      clearTimeout(timer.current!);
      setIsLoading(false);
    };
  }, [userData._id, searchQuery]);

  return (
    <section
      data-aos="fade-right"
      onKeyUp={(e) => e.key == "Escape" && closeSearch()}
      className={`text-white fixed  w-full md:block md:w-[40%] lg:w-[35%] ${
        isRoomDetailsShown ? "xl:w-[25%]" : "xl:w-[30%]"
      }  h-full inset-0 overflow-auto bg-leftBarBg transition-all z-40`}
    >
      <div className="flex sticky top-0 gap-3 bg-inherit items-center justify-between w-full  px-2 py-4">
        <IoMdArrowRoundBack
          onClick={closeSearch}
          className="size-6 cursor-pointer "
        />

        <input
          dir="auto"
          value={searchQuery}
          ref={inputRef}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="bg-inherit placeholder:text-white/60 w-full outline-hidden"
          type="text"
        />
      </div>

      <div className="px-3 mt-6 bg-inherit">
        {isLoading && <RoomSkeleton />}

        <div className="flex flex-col w-full ">
          {searchResult?.length ? (
            <span className="text-darkGray text-sm">
              {searchResult.length} result
            </span>
          ) : null}

          {searchResult?.length
            ? searchResult.map((data, index) => (
                <div key={index} onClick={closeSearch}>
                  <SearchResultCard
                    key={index}
                    {...data}
                    query={searchQuery}
                    myData={userData}
                  />
                </div>
              ))
            : searchFinished &&
              !isLoading && (
                <div
                  data-aos="fade-up"
                  className="flex flex-center h-96 text-darkGray"
                >
                  No results
                </div>
              )}
        </div>
      </div>
    </section>
  );
};

export default SearchPage;
