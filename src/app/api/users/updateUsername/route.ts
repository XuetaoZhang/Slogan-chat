import connectToDB from "@/db";
import UserSchema from "@/schemas/userSchema";

export const POST = async (req: Request) => {
  try {
    await connectToDB();
    const { query } = await req.json();

    const trimmedQuery = query.toLowerCase().trim();

    const isQueryValidAndAvailable =
      trimmedQuery.length >= 5 && trimmedQuery.length <= 20;
    if (!isQueryValidAndAvailable)
      return Response.json({ isValid: false }, { status: 403 });

    const usernamePattern = /^(?!.*[_.-]{2,})[a-zA-Z0-9_]{5,20}$/;
    const isPatternValid = usernamePattern.test(trimmedQuery);
    if (!isPatternValid)
      return Response.json(
        { isValid: false, message: "Username format is invalid." },
        { status: 403 }
      );

    const isUsernameExist = await UserSchema.findOne({
      username: { $regex: new RegExp(`^${query}$`, "i") },
    });

    return Response.json(
      {
        isValid: !isUsernameExist,
        message: isUsernameExist ? "This username is already taken." : null,
      },
      { status: isUsernameExist ? 403 : 200 }
    );
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: "Unknown error, try later." },
      { status: 500 }
    );
  }
};
