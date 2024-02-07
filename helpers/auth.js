import jwt from "jsonwebtoken";
import { verifyJwt } from "./jwt.js";

export const authJWT = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(200).send('no token....'); // so frontend throws no error if no token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log({decoded})
    req.username = decoded.username;
    req.id = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(400).json("Nicht Autorisiert, kein token");
  }
};
