import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { usersData, projectsData, tasksData } from "../seed_data/seed_data.js";
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

async function addUsersData(knex) {
  const usersWithHashedPasswords = [];

  for (let i = 0; i < usersData.length; i++) {
    const user = usersData[i];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    usersWithHashedPasswords.push({
      ...user,
      password: hashedPassword,
    });
  }

  await knex("users").insert(usersWithHashedPasswords);
}

async function addProjectsData(knex, users) {
  for (let i = 0; i < projectsData.length; i++) {
    const randomIndex = Math.floor(Math.random() * users.length);
    const randomUserId = users[randomIndex].id;

    await knex("projects").insert({
      ...projectsData[i],
      manager_id: randomUserId,
    });

    await knex("user_projects").insert({
      id: uuidv4(),
      project_id: projectsData[i].id,
      user_id: randomUserId,
      role: "manager",
    });
  }
}

async function addTasksData(knex, userProjects) {
  for (let i = 0, j = 0; i < userProjects.length; i++, j++) {
    const user_id = userProjects[i].user_id;
    const project_id = userProjects[i].project_id;

    if (j < tasksData.length) {
      await knex("tasks").insert({
        ...tasksData[j++],
        user_id: user_id,
        project_id: project_id,
      });

      await knex("tasks").insert({
        ...tasksData[j],
        user_id: user_id,
        project_id: project_id,
      });
    }
  }
}

export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("user_projects").del();
  await knex("tasks").del();
  await knex("projects").del();
  await knex("users").del();

  await addUsersData(knex);

  const users = await knex("users").select("id");

  await addProjectsData(knex, users);

  const user_projects = await knex("user_projects").select(
    "id",
    "user_id",
    "project_id"
  );

  await addTasksData(knex, user_projects);
}
