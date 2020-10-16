import { Entity, OneToMany, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Transaction from "./TransactionModel";
import User from "./UserModel";

/**
 * FIXME
 */
@Entity()
class Account {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @OneToMany( () => Transaction, transaction => transaction.id, { cascade: true})
  public transactions: Transaction[];

  @Column()
  public name: string;

  @ManyToOne( () => User, user => user.id)
  public owner: User;
}

export default Account;
