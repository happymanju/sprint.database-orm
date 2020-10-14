/**
 * TypeORM config file
 * 
 * README!
 * What is this?
 * So far, you have seen various config files including `.eslintignore`, `.eslintrc`, etc. 
 * Config files determine and control the behaviour of libraries. 
 * As for TypeORM, it is no different than most libraries. It requires a config file to tell it:
 *  - where to find the database
 *  - what the credentials of the database are
 *  - where to find entities, migrations, seed files
 *  - etc...
 * 
 * It is not necessary to fully understand each configuration for now. The purpose 
 * is to expose you to the idea of using a config file to govern the behaviour of a program.
 */

export = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || "expense_manager",
  password: process.env.DB_PASSWORD || "expense_manager",
  database: process.env.DB_NAME || "expense_manager",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  seeds: ["src/seeds/**/*.ts"],
  logging: false,
  migrationsRun: false /* Disable auto-run migration */,
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/migrations",
  },
};
