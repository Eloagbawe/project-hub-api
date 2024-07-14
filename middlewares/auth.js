import jwt from "jsonwebtoken";
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await knex("users")
        .select("id", "first_name", "last_name")
        .where({ id: decoded.id })
        .first();

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      } else {
        req.user = user;
      }
      next();
    } catch (err) {
      if (
        err.message === "invalid signature" ||
        err.message === "invalid token"
      ) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (err.message === "jwt expired") {
        return res.status(401).json({ message: "Token expired" });
      } else {
        return res.status(401).json({ message: "Not authorized" });
      }
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
