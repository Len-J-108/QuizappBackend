import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function issueJwt(_data) {
    return jsonwebtoken.sign(_data, process.env.JWT_SECRET, {
      expiresIn: '2days',
    });
}

export function verifyJwt(token) {
    if (!token) return;
    return jsonwebtoken.verify(token, process.env.JWT_SECRET)
}