import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

export const getUsers = async (req, res) => {
  const { query, project_id } = req.query;

  try {
    const users = await knex("users")
      .select("id", "first_name", "last_name", "email")
      .orWhere("email", "LIKE", `%${query}%`)
      .orWhere("first_name", "LIKE", `%${query}%`)
      .orWhere("last_name", "LIKE", `%${query}%`);

    let output = [...users];

    if (project_id) {
      const user_projects = await knex("user_projects")
        .select("user_id")
        .where({ project_id });

      const teamMembers = user_projects.map((item) => item.user_id);

      output = output.filter((x) => !teamMembers.includes(x.id));
    }

    res.status(200).json(output.filter((user) => user.id !== req.user.id));
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};
