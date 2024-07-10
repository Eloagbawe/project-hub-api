import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

export const getUsers = async (req, res) => {
  const { query } = req.body;

  try {
    const users = await knex("users")
      .select("id", "first_name", "last_name", "email")
      .orWhere("email", "LIKE", `%${query}%`)
      .orWhere("first_name", "LIKE", `%${query}%`)
      .orWhere("last_name", "LIKE", `%${query}%`);

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
  }
};
