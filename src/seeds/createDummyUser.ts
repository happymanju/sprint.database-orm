/**
 * Seeding database using `typeorm-seeding`
 * 
 * README!
 * What is database seeding?
 * - Database seeding is the process of providing initial data to the database 
 *   when the application (or database) is installed
 * - It is useful to populate lookup tables. Yes, you read it right, lookup tables data
 *   can be populated using both seed files and migration files. 
 * - Seed files are also commonly used to populate data for development purpose.
 * 
 * In this sprint, we are using `typeorm-seeding`, a library that fills the deficiency of `typeorm`
 * to seed our database. 
 * 
 * Refs: 
 * - https://www.npmjs.com/package/typeorm-seeding
 * - https://www.npmjs.com/package/typeorm-seeding#%E2%9D%AF-basic-seeder
 */

import { Factory, Seeder } from 'typeorm-seeding'
import { Connection } from 'typeorm'

/**
 * FIXME
 * - Populate the database with users defined in `src/seeds/users.json` 
 * 
 * Tip!
 * - Consult the documentation listed in **Refs** above
 */
export default class CreateUsers implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        
    }
}