import connectToDB from "@/db";
import RoomSchema from "@/schemas/roomSchema";
import UserSchema from "@/schemas/userSchema";
import { cookies } from "next/headers";
import { hash } from "bcrypt";
import tokenGenerator from "@/utils/TokenGenerator";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const { username, phone, password: purePass } = await req.json();

    const password = await hash(purePass, 12);

    const userData = await UserSchema.create({
      name: username?.replace("@", ""),
      lastName: "",
      username: username.toLowerCase(),
      password,
      phone: phone.toString(),
    });

    await RoomSchema.create({
      name: "Saved Messages",
      avatar: "",
      type: "private",
      creator: userData._id,
      participants: [userData._id],
    });

    const token = tokenGenerator(userData.phone, 7);

    (await cookies()).set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 15,
      sameSite: "none",
      path: "/",
      secure: true,
    });
    return Response.json(userData, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Registration Error:", error);
    const keyPattern = error.errorResponse?.keyPattern;
    const existedUsernameOrPhone = keyPattern
      ? Object.keys(keyPattern).join("")
      : null;

    if (existedUsernameOrPhone) {
      const duplicatedProp =
        existedUsernameOrPhone == "phone" ? "phone" : "username";
      return Response.json(
        { message: `Already there is an account using this ${duplicatedProp}` },
        { status: 421 }
      );
    }

    return Response.json(
      { message: "Unknown error, try later" },
      { status: 421 }
    );
  }
};
