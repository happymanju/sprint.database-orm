import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from "typeorm";
import Account from "./AccountModel";

/**
 * FIXME
 */
class Transaction {
  public id: string;
  public amount: number;
  public account: Account;
  public transactionDate: Date;
  public description: string;
}

export default Transaction;
