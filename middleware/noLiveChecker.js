import User from "../models/userModel.js";
import jsonwebtoken from "jsonwebtoken";

export const cookieChecker = async (cookie, res, next) => {
  const cookieNoLiveToken = cookie;
  const noLivePoints = cookieNoLiveToken !== undefined;
  if (noLivePoints) {
    const cookieTokenIsValid = jsonwebtoken.verify(
      cookieNoLiveToken,
      process.env.JWT_SECRET
    );
    if (cookieTokenIsValid) {
      const decodedToken = jsonwebtoken.decode(cookieNoLiveToken);
      const tokenExpirationDate = new Date(decodedToken.exp * 1000);
      return tokenExpirationDate;
    } else {
      return false;
    }
  }
};


export const dbChecker = async (username) => {
  const user = await User.findOne({ username });
  const dbNoLiveToken = user.wrongAnswersToken;
  const noLivePoints = dbNoLiveToken !== "";
  if (noLivePoints) {
    const decodedToken = jsonwebtoken.decode(dbNoLiveToken);
    const tokenExpirationDate = new Date(decodedToken.exp * 1000);
    const currentDate = new Date();
    if (currentDate < tokenExpirationDate) {
      return tokenExpirationDate;
    } else {
      return false;
    }
  } else {
    return false;
  }
};