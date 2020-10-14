import { createConnection, ConnectionOptions } from "typeorm";
import dbConfig from "./ormconfig";

class DatabaseConnectionManager {
  /**
   * Connects to database
   *
   * Advanced Requirement:
   * - FYI, `createConnection` does more than simple connecting to our database,
   *   It create a pool of reusable database connection to reduce the performance cost
   *   of having to create a new connection for every database request.
   */
  public static async connect() {
    const connection = await createConnection(
      dbConfig as ConnectionOptions /* ⬅️ You can ignore the `as` operator for now */,
    );
    // https://github.com/typeorm/typeorm/issues/3286
    // const driver = connection.driver;
    // driver.postgres.defaults.parseInputDatesAsUTC = true;
    return connection;
  }
}

export default DatabaseConnectionManager;
