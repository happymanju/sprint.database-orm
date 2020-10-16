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
@Entity()
class Transaction {

  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column()
  public amount: number;

  @ManyToOne( () => Account, account => account.transactions)
  public account: Account;

  @Column()
  public transactionDate: Date;

  @Column({ nullable: true})
  public description: string;
}

export default Transaction;
