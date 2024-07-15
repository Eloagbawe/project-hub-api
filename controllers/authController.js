import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import initKnex from "knex";
import configuration from "../knexfile.js";
import { v4 as uuidv4 } from "uuid";

const knex = initKnex(configuration);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide an email and password" });
  }

  try {
    const user = await knex("users").where({ email }).first();
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        message: "Login Successful",
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
        },
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};

export const signup = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    let missing = [];

    if (!first_name) {
      missing.push("First Name");
    }

    if (!last_name) {
      missing.push("Last Name");
    }

    if (!email) {
      missing.push("Email");
    }

    if (!password) {
      missing.push("Password");
    }

    return res.status(400).json({
      message: `Missing fields - ${missing.join(", ")}`,
    });
  }

  const emailPattern =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  if (!emailPattern.test(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  try {
    const userFound = await knex("users").where({ email }).first();
    if (userFound) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserInput = {
      id: uuidv4(),
      first_name,
      last_name,
      email,
      password: hashedPassword,
    };
    await knex("users").insert(newUserInput);

    res.status(201).json({
      message: "Sign up successful",
      user: {
        id: newUserInput.id,
        first_name: newUserInput.first_name,
        last_name: newUserInput.last_name
      },
      token: generateToken(newUserInput.id),
    });
  } catch (err) {
    res.status(500).json({ message: "An error has occurred on the server" });
  }
};
