import { Entity, OneToMany, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Transaction from "./TransactionModel";
import User from "./UserModel";

/**
 * FIXME
 */
class Account {
  public id: string;
  public transactions: Transaction[];
  public name: string;
  public owner: User;
}

export default Account;
