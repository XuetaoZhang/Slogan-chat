import { cookies } from "next/headers";

export const GET = async () => {
  try {
    (await cookies()).delete("token");
    return Response.json("Done", { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: "Unknown error, try later." },
      { status: 500 }
    );
  }
};
