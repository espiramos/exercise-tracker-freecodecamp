process.env.TZ = "Etc/Universal"; // UTC +00:00
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./models/user");
const Log = require("./models/logs");
var moment = require("moment");
require("dotenv").config();
let mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .post(async (req, res) => {
    try {
      if (!req.body.username) {
        return res.json({ error: "Provide username" });
      }
      let user = new User({
        username: req.body.username,
      });
      await user.save();
      return res.json({
        username: user.username,
        _id: user._id,
      });
    } catch (e) {
      return res.json({ error: e.message });
    }
  })
  .get(async (req, res) => {
    try {
      let users = await User.find();
      return res.json(users);
    } catch (e) {
      return res.json({ error: e.message });
    }
  });

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    if (!req.body.description || !req.body.duration) {
      throw new Error("Error");
    }
    if (!req.params._id) {
      return res.json({
        error: "ID not found",
      });
    }

    let user = await User.findOne({ _id: req.params._id });
    if (!user) {
      return res.json({
        error: "ID not found",
      });
    }
    let log = new Log({
      description: req.body.description,
      duration: Number(req.body.duration),
      date:
        req.body.date === "" || !req.body.date
          ? new Date()
          : new Date(req.body.date),
      user: user._id,
    });
    await log.save();

    return res.json({
      _id: user._id,
      username: user.username,
      date: !req.body.date
        ? moment().format("ddd MMM DD YYYY")
        : moment(log.date).format("ddd MMM DD YYYY"),
      duration: Number(log.duration),
      description: log.description,
    });
  } catch (e) {
    console.log(e);
    return res.json({ error: e.message });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    if (!req.params._id) {
      return res.json({ error: "Invalid Id" });
    }
    let user = await User.findOne({ _id: req.params._id });
    if (!user) {
      return res.json({ error: "User not found" });
    }
    let logs = [];
    if (req.query.from || req.query.to || req.query.limit) {
      let from = 0;
      let to = new Date();
      if (req.query.from && new Date(req.query.from)) {
        from = new Date(req.query.from);
      }
      if (req.query.to && new Date(req.query.to)) {
        to = new Date(req.query.to);
      }
      let userlogs = await Log.find({
        user: user._id,
        date: {
          $gte: from,
          $lte: to,
        },
      }).limit(parseInt(req.query.limit) || null);
      for (let i = 0; i < userlogs.length; i++) {
        logs.push({
          description: userlogs[i].description,
          duration: userlogs[i].duration,
          date: new Date(userlogs[i].date).toDateString(),
        });
      }
    } else {
      let userlogs = await Log.find({ user: user._id });
      for (let i = 0; i < userlogs.length; i++) {
        logs.push({
          description: userlogs[i].description,
          duration: userlogs[i].duration,
          date: new Date(userlogs[i].date).toDateString(),
        });
      }
    }
    return res.json({
      username: user.username,
      _id: user._id,
      count: logs.length,
      log: logs,
    });
  } catch (e) {
    return res.json({ error: e.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
