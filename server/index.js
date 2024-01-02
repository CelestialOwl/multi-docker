const keys = require("./keys");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient
.query("CREATE TABLE IF NOT EXISTS values (number INT)")
.catch((err) => console.log(err));


//Redis
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

//Express Routes
app.get("/", (req, res) => {
  res.send("hi");
});

app.get("/values/all", async (req, res) => {
  try {
    const result = await pgClient.query('SELECT * from values');
    res.send(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Errors');
  }
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }
  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
  pgClient.query("select * from  values").then(res => console.log("rwos", res.rows))

  res.send({ working: true });
});


app.listen(5000, err => {
    console.log('Listening!!')
})