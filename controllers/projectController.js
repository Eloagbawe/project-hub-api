import initKnex from "knex";
import configuration from "../knexfile.js";
import { v4 as uuidv4 } from "uuid";

const knex = initKnex(configuration);

const projectListWithTeam = async (user_id) => {
  const output = await knex("projects")
    .join("user_projects", "projects.id", "user_projects.project_id")
    .join("users", "user_projects.user_id", "users.id")
    .join("users as manager", "projects.manager_id", "manager.id")
    .leftJoin(
      "user_projects as user_projects2",
      "projects.id",
      "user_projects2.project_id"
    )
    .leftJoin(
      "users as team_member",
      "user_projects2.user_id",
      "team_member.id"
    )
    .where("users.id", `${user_id}`)
    .groupBy("projects.id")
    .select(
      "projects.id",
      "projects.title",
      "projects.description",
      "projects.updated_at",
      "manager.id as manager_id",
      "manager.first_name as manager_first_name",
      "manager.last_name as manager_last_name",
      "manager.email as manager_email",
      knex.raw(`GROUP_CONCAT(
        DISTINCT JSON_OBJECT(
          'id', team_member.id,
          'email', team_member.email,
          'first_name', team_member.first_name,
          'last_name', team_member.last_name,
          'role', user_projects2.role
        ) ORDER BY team_member.last_name ASC SEPARATOR ','
      ) AS team`)
    )
    .orderBy("projects.updated_at", "desc");
  const result = output.map((row) => ({
    ...row,
    team: row.team ? JSON.parse(`[${row.team}]`) : [],
  }));

  return result;
};

const projectOutput = async (project_id) => {
  const output = await knex("projects")
    .join("user_projects", "projects.id", "user_projects.project_id")
    .join("users", "user_projects.user_id", "users.id")
    .leftJoin("user_projects as up2", "projects.id", "up2.project_id")
    .leftJoin("users as u2", "up2.user_id", "u2.id")
    .where("projects.id", `${project_id}`)
    .groupBy("projects.id")
    .select(
      "projects.id",
      "projects.title",
      "projects.description",
      "projects.updated_at",
      "projects.manager_id",
      "projects.to_do_positions",
      "projects.in_progress_positions",
      "projects.in_review_positions",
      "projects.done_positions",
      knex.raw(`GROUP_CONCAT(
      DISTINCT JSON_OBJECT(
        'id', u2.id,
        'email', u2.email,
        'first_name', u2.first_name,
        'last_name', u2.last_name,
        'role', up2.role
      ) ORDER BY u2.last_name ASC SEPARATOR ','
    ) AS team`)
    )
    .first();

  if (!output) {
    return null;
  }

  const mappedProjectOutput = {
    ...output,
    team: output.team ? JSON.parse(`[${output.team}]`) : [],
  };

  return mappedProjectOutput;
};

const projectTasksOutput = async (project_id) => {
  const tasks = await knex("tasks")
    .leftJoin("users", "users.id", "tasks.user_id")
    .where("tasks.project_id", `${project_id}`)
    .select(
      "tasks.id",
      "tasks.title",
      "tasks.description",
      "tasks.project_id",
      "tasks.status",
      "tasks.user_id",
      "users.id as user.id",
      "users.first_name as user.first_name",
      "users.last_name as user.last_name"
    )
    .orderBy("tasks.created_at", "asc");

  const mappedTasks = tasks.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    project_id: row.project_id,
    user: row.user_id
      ? {
          id: row["user.id"],
          first_name: row["user.first_name"],
          last_name: row["user.last_name"],
        }
      : null,
  }));

  return mappedTasks;
};

const taskOutput = async (task_id) => {
  const task = await knex("tasks")
    .leftJoin("users", "users.id", "tasks.user_id")
    .where("tasks.id", `${task_id}`)
    .select(
      "tasks.id",
      "tasks.title",
      "tasks.description",
      "tasks.project_id",
      "tasks.status",
      "tasks.user_id",
      "users.id as user.id",
      "users.first_name as user.first_name",
      "users.last_name as user.last_name"
    )
    .first();

  const mappedTask = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    project_id: task.project_id,
    user: task.user_id
      ? {
          id: task["user.id"],
          first_name: task["user.first_name"],
          last_name: task["user.last_name"],
        }
      : null,
  };

  return mappedTask;
};

export const getProjects = async (req, res) => {
  try {
    const result = await projectListWithTeam(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const addProject = async (req, res) => {
  const { title, description, team } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Please provide a project title" });
  }

  let newProject = {};
  let projectAdded = false;

  try {
    newProject = {
      id: uuidv4(),
      title,
      description,
      manager_id: req.user.id,
      to_do_positions: JSON.stringify([]),
      in_progress_positions: JSON.stringify([]),
      in_review_positions: JSON.stringify([]),
      done_positions: JSON.stringify([])
    };

    await knex("projects").insert(newProject);

    await knex("user_projects").insert({
      id: uuidv4(),
      user_id: req.user.id,
      project_id: newProject.id,
      role: "manager",
    });
    projectAdded = true;
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }

  let teamMembersAdded = false;

  try {
    if (projectAdded) {
      if (!team || team.length === 0) {
        teamMembersAdded = true;
      } else {
        const uniqueIds = [...new Set(team)];
        const filteredList = uniqueIds.filter((val) => val !== req.user.id);

        let teamList = [];

        if (team.length > 0) {
          teamList = filteredList.map((val) => {
            return {
              id: uuidv4(),
              user_id: val,
              project_id: newProject.id,
              role: "member",
            };
          });

          const result = await knex("user_projects").insert(teamList);
          if (result) {
            teamMembersAdded = true;
          }
        }
      }
    }
  } catch (err) {
    res.status(500).json({
      message:
        "Project Added Successfully but there was an error adding team members",
      project: newProject.id,
    });
  }

  try {
    if (projectAdded && teamMembersAdded) {
      const project = await projectOutput(newProject.id);
      res.status(201).json({
        message: "Project Added Successfully",
        project,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const getProject = async (req, res) => {
  const { id } = req.params;

  try {
    const output = await projectOutput(id);

    if (!output) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isUserMember = output.team.find(
      (member) => member.id === req.user.id
    );

    if (!isUserMember) {
      return res
        .status(401)
        .json({ message: "Logged in user not authorized to view project" });
    }

    res.status(200).json({
      ...output,
    });
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const updateProject = async (req, res) => {
  const { title, description, team } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Please provide a project title" });
  }

  if (!team || team.length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide an array of team members id" });
  }

  let members = [];

  try {
    let newTeamMembers = [];

    const user_projects = await knex("user_projects")
      .select("user_id", "role")
      .where({ project_id: id });

    if (user_projects.length > 0) {
      const isUserManager = user_projects.find(
        (val) => val.user_id === req.user.id && val.role === "manager"
      );

      if (!isUserManager) {
        return res
          .status(401)
          .json({ message: "Logged in user not authorized to update project" });
      }

      const teamMembers = user_projects.map((item) => item.user_id);

      members = teamMembers;
      newTeamMembers = team.filter((x) => !teamMembers.includes(x));
    }

    if (newTeamMembers.length > 0) {
      const teamList = newTeamMembers.map((val) => {
        return {
          id: uuidv4(),
          user_id: val,
          project_id: id,
          role: "member",
        };
      });
      await knex("user_projects").insert(teamList);
    }
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }

  try {
    if (members.length > 0) {
      const isUserMember = members.find((val) => val === req.user.id);

      if (!isUserMember) {
        return res
          .status(401)
          .json({ message: "Logged in user not authorized to update project" });
      }
    } else {
      return res
        .status(404)
        .json({ message: "No project with this id exists" });
    }

    await knex("projects").where({ id }).update({ title, description });

    const project = await projectOutput(id);

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const removeTeamMember = async (req, res) => {
  const { projectId, userId } = req.params;

  if (!projectId || !userId) {
    return res.status(400).json({message: 'Please provide a project id and a user id'});
  }

  try {
    const project =  await knex("projects").where({ id: projectId }).select('id', 'manager_id').first();

    if (!project) {
      return res.status(404).json({message: 'Project not found'});
    }

    if (project.manager_id !== req.user.id) {
      return res.status(401).json({ message: 'Logged in user not authorized to remove team member from project'});
    }

    if (userId === project.manager_id) {
      return res.status(400).json({ message: 'Manager cannot be removed from project team'});
    }
    const numDeleted = await knex("user_projects").where({ project_id: projectId, user_id: userId}).del();

    if (numDeleted === 0) {
      return res.status(400).json({message: 'User is not a project member'} )
    } else {
      await knex('tasks').where({ project_id: projectId, user_id: userId }).update({ user_id: null});
      res.status(200).json({message: 'User removed successfully'})
    }
    
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
}

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project =  await knex("projects").where({ id }).select('id', 'manager_id').first();

    if (!project) {
      return res.status(404).json({message: 'Project not found'});
    }

    if (project.manager_id !== req.user.id) {
      return res.status(401).json({ message: 'Logged in user not authorized to delete project'});
    }

    await knex("projects").where({ id }).del();

    res.status(204).json({ message: 'Project deleted successfully' })

  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }

}

export const getProjectTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await projectOutput(id);

    if (!project) {
      return res
        .status(404)
        .json({ message: "No project with that id exists" });
    }

    const isUserMember = project.team.find(
      (member) => member.id === req.user.id
    );

    if (!isUserMember) {
      return res.status(401).json({
        message: "Logged in user not authorized to view project tasks",
      });
    }

    const tasks = await projectTasksOutput(id);

    const positions = {
      todo: project.to_do_positions,
      inProgress: project.in_progress_positions,
      inReview: project.in_review_positions,
      done: project.done_positions
    }

    const orderedTasks = {
      todo: [],
      inProgress: [],
      inReview: [],
      done: []
    }

    for (let p in positions) {
      const taskIdsForStatus = positions[p];

      orderedTasks[p] = taskIdsForStatus
        .map(taskId => tasks.find(task => task.id === taskId)) 
    }

    res.status(200).json({ project_id: project.id, tasks: orderedTasks
  
  });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const getProjectTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await projectOutput(id);

    if (!project) {
      return res
        .status(404)
        .json({ message: "No project with that id exists" });
    }

    const isUserMember = project.team.find(
      (member) => member.id === req.user.id
    );

    if (!isUserMember) {
      return res.status(401).json({
        message: "Logged in user not authorized to view project team",
      });
    }

    res.status(200).json({ project_id: project.id, team: project.team });
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const addProjectTask = async (req, res) => {
  const { title, description, status, user_id } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Please provide task title" });
  }

  try {
    const project = await projectOutput(id);

    if (!project) {
      return res
        .status(404)
        .json({ message: "No project with that id exists" });
    }

    const isUserMember = project.team.find(
      (member) => member.id === req.user.id
    );

    if (!isUserMember) {
      return res.status(401).json({
        message:
          "Logged in user not authorized to create tasks for this project",
      });
    }

    if (user_id) {
      const isAssignedUserMember = project.team.find(
        (member) => member.id === user_id
      );

      if (!isAssignedUserMember) {
        return res.status(400).json({
          message: "User assigned must be in the project team",
        });
      }
    }

    if (
      status &&
      !["to do", "in progress", "in review", "done"].includes(
        status.toLowerCase()
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid task status, status should be either 'to do', 'in progress', 'in review', or 'done'",
      });
    }

    const newTask = {
      id: uuidv4(),
      title,
      description,
      status: status ? status.toLowerCase() : "to do",
      project_id: id,
      user_id,
    };

    await knex("tasks").insert(newTask);

    const taskStatusKey = newTask.status.replace(/ /g, "_");
    const taskOrderList = [...project[`${taskStatusKey}_positions`]];

    taskOrderList.push(newTask.id);

    await knex("projects").where({ id }).update({
      [`${taskStatusKey}_positions`]: JSON.stringify(taskOrderList)
    })

    const task = await taskOutput(newTask.id);

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const updateProjectTask = async (req, res) => {
  const { title, description, status, user_id } = req.body;
  const { projectId, taskId } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Please provide task title" });
  }

  try {
    const project = await projectOutput(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: "No project with that id exists" });
    }

    const isUserMember = project.team.find(
      (member) => member.id === req.user.id
    );

    if (!isUserMember) {
      return res.status(401).json({
        message:
          "Logged in user not authorized to update tasks for this project",
      });
    }

    if (user_id) {
      const isAssignedUserMember = project.team.find(
        (member) => member.id === user_id
      );

      if (!isAssignedUserMember) {
        return res.status(400).json({
          message: "User assigned must be in the project team",
        });
      }
    }

    const updatedStatus = status?.dest?.toLowerCase();

    if (
      updatedStatus &&
      !["to do", "in progress", "in review", "done"].includes(
        updatedStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid task status, status should be either 'to do', 'in progress', 'in review', or 'done'",
      });
    }

    const taskDetails = {
      title,
      description,
      status: updatedStatus,
      user_id,
    };

    const numUpdated = await knex("tasks")
      .where({ id: taskId })
      .update(taskDetails);

    if (numUpdated === 0) {
      return res.status(404).json({ message: "No task with that id exists" });
    }

    const srcKey = status.src.replace(/ /g, "_");
    const destKey = status.dest.replace(/ /g, "_")

    if ((status.src !== status.dest) && !status.pos) {
      const srcTasks = [...project[`${srcKey}_positions`]];
      const destTasks = [...project[`${destKey}_positions`]];

      const updatedSrcTasks = srcTasks.filter((t) => t !== taskId);
      destTasks.push(taskId)

      await knex("projects").where({ id: projectId }).update({ 
        [`${srcKey}_positions`]: JSON.stringify(updatedSrcTasks),
        [`${destKey}_positions`]: JSON.stringify(destTasks)
      });
    }

    else if ((status.src === status.dest) && (status.pos.src !== status.pos.dest)) {
      const srcTasks = [...project[`${srcKey}_positions`]];

      srcTasks.splice(status.pos.src, 1);
      srcTasks.splice(status.pos.dest, 0, taskId);

      await knex("projects").where({ id: projectId }).update({ 
        [`${srcKey}_positions`]: JSON.stringify(srcTasks)
      });
    }

    else if (status.src !== status.dest){
      const srcTasks = [...project[`${srcKey}_positions`]];
      const destTasks = [...project[`${destKey}_positions`]];

      srcTasks.splice(status.pos.src, 1);
      destTasks.splice(status.pos.dest, 0, taskId);

      await knex("projects").where({ id: projectId }).update({ 
        [`${srcKey}_positions`]: JSON.stringify(srcTasks),
        [`${destKey}_positions`]: JSON.stringify(destTasks)
      });
    }

    const task = await taskOutput(taskId);

    res.status(200).json({ message: "Task updated successfully", task });

  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const deleteProjectTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { status } = req.query;

  if (!status) {
    res.status(400).json({ message: "Please provide the task status in the query" })
  }

  try {
    const project = await projectOutput(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: "No project with that id exists" });
    }

    const isUserMember = project.team.find(
      (member) => member.id === req.user.id
    );

    if (!isUserMember) {
      return res.status(401).json({
        message:
          "Logged in user not authorized to delete tasks for this project",
      });
    }

    const numDeleted = await knex("tasks").where({ id: taskId }).del();

    if (numDeleted === 0) {
      return res.status(404).json({ message: "No task with that id exists" });
    }

    const statusKey = status.replace(/ /g, "_");

    await knex("projects").where({ id: projectId }).update({
      [`${statusKey}_positions`]: JSON.stringify(
        project[`${statusKey}_positions`].filter((id) => id !== taskId)
      )
    })

    res.status(204).json({ message: "Task deleted successfully" });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};
