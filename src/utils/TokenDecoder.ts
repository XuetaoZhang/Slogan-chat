import { Secret, verify } from "jsonwebtoken";

const tokenDecoder = (token: string) => {
  try {
    return verify(token, process.env.secretKey as Secret);
  } catch (error) {
    console.log(error);

    return false;
  }
};

export default tokenDecoder;
