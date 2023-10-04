require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.static("public"));

mongoose.set("strictQuery", false); // Desativa o modo estrito (deprecated em Mongoose 7)

//Config JSON response
app.use(express.json());

//Models
const User = require("./models/User");

//Public Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/src/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/src/registro.html");
});

//Private Rote
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  //check if user exist
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }
  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido" });
  }
}

//Register User
app.post("/auth/register", async (req, res) => {
  console.log("Dados recebidos no servidor:", req.body);
  const { name, email, password, confirmPassword } = req.body;
  console.log("Email recebido:", email);
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
    return res
      .status(422)
      .json({ msg: "As senhas não conferem", password, confirmPassword });
  }

  //check if user exist
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor utilize outro email" });
  }

  //Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //create User
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ success: true, msg: "Usuário criado com sucesso" });
  } catch (error) {
    res.status(500).json({ msg: "Aconteceu um erro no servidor" });
  }
});

//Login Server
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  //Validation
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigátorio!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigátorio!" });
  }

  //check if user exist
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  //check if password match
  const checkPassowrd = await bcrypt.compare(password, user.password);

  if (!checkPassowrd) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user.id,
      },
      secret
    );
    res
      .status(200)
      .json({ success: true, msg: "Autenticação feita com sucesso", token });
  } catch (err) {
    res.status(500).json({ msg: "Aconteceu um erro no servidor" });
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
