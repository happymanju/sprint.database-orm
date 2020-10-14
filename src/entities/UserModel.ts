import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

/**
 * User entity has been defined
 * You shouldn't need to alter any code here
 */
@Entity({name: "users" /* Relation name in database */})
class User {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    length: 100,
  })
  public username: string;

  @Column()
  public passwordHash: string;

  @Column({ nullable: true })
  public displayName: string;
}

export default User;
