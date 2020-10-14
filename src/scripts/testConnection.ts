import DatabaseConnectionManager from "../database";

DatabaseConnectionManager.connect()
  .then(() => {
    console.info("Successfully connected to your database!");
  })
  .catch((err) => {
    console.error(err);
    console.error("Couldn't connect to your database. Please check your configuration.");
  });
