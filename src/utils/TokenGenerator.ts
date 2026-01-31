import { Secret, sign } from "jsonwebtoken";

const tokenGenerator = (data: object, days: number = 7) =>
  sign({ phone: data }, process.env.secretKey as Secret, {
    expiresIn: 60 * 60 * 24 * days,
  });

export default tokenGenerator;
