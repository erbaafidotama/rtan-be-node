require("dotenv").config();
const app = require("./app");
const { sequelize } = require("../models"); // Sequelize index from /models

const port = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate(); // verifies DB connection
    console.log("Database connected.");
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
})();
