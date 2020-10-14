import { Repository, getRepository, DeleteResult } from "typeorm";
import Account from "../../entities/AccountModel";
import { IManager } from "../common/manager";

interface AccountWithBalance extends Account {
  balance: number;
}

class AccountManager implements IManager {
  protected accountRepository: Repository<Account>;

  /**
   * FIXME
   * After defining the Account entity,
   * uncomment the lines in the constructor definition
   */
  constructor() {
    // this.accountRepository = getRepository(Account);
  }

  /**
   * FIXME
   * Get an account
   *
   * Requirements:
   * - Derive balance (both debit and credit)
   */

  public async getAccount(accountId: string): Promise<AccountWithBalance> {
    // You are free to remove any lines below
    const blankAccount = <AccountWithBalance>new Account();

    // FIXME Your should derive account balance by aggregating all the transactions
    let accountBalanceDerived = 0.0;
    blankAccount.balance = accountBalanceDerived;

    return Promise.resolve(blankAccount);
  }

  /**
   * FIXME
   * create a new account
   */
  public async createAccount(details: Partial<Account>): Promise<Account> {
    return Promise.resolve(new Account());
  }

  /**
   * FIXME
   * update account details
   */
  public async updateAccount(accountId: string, changes: Partial<Account>): Promise<Account> {
    return Promise.resolve(new Account());
  }

  /**
   * FIXME
   * delete account
   *
   * Requirements:
   * - Cascade and delete all transactions
   */
  public async deleteAccount(accountId: string): Promise<DeleteResult | void> {
    return Promise.resolve();
  }
}

export default AccountManager;
