const mongoose = require("mongoose");
const {MongoDB_Password} = require("./config");


  mongoose.connect(
    "mongodb+srv://Tanmoy23:" + MongoDB_Password + "@cluster0.ued66gq.mongodb.net/paytm-clone?retryWrites=true&w=majority&appName=Cluster0"
  ).then(() => {console.log("Connection successful")})
  .catch(() => {
  console.log(`Connection failed`);
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("user", userSchema);
const Account = mongoose.model("account", accountSchema);

module.exports = { User, Account };
