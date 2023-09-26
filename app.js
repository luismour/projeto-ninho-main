require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

mongoose.set("strictQuery", false); // Desativa o modo estrito (deprecated em Mongoose 7)

//Config JSON response
app.use(express.json());

//Models
const User = require("./models/User");

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo ao nosso site!" });
});

//Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  //validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigátorio!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigátorio!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigátorio!" });
  }
  if (password !== confirmPassword) {
    return res.status(422).json({ msg: "As senhas não conferem" });
  }

  //check if user exist
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor utilize outro email" });
  }
});
//Credentials

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    "mongodb+srv://luismour:DrVx4ttPj0Q0D1YY@cluster0.duy5ovw.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp"
  )
  .then(() => {
    app.listen(8080);
    console.log("Conectado ao banco de dados");
  })
  .catch((err) => console.log(err));
