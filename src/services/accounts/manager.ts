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
    this.accountRepository = getRepository(Account);
  }

  /**
   * FIXME
   * Get an account
   *
   * Requirements:
   * - Derive balance (both debit and credit)
   */

  public async getAccount(accountId: string): Promise<Account> {
    // You are free to remove any lines below
    //const blankAccount = <AccountWithBalance>new Account();
    //const blankAccount = await this.accountRepository.findOne(accountId);
    //console.log('test account: ', blankAccount);

    // FIXME Your should derive account balance by aggregating all the transactions
    // console.log("ACCOUNT!!!!!",this.accountRepository);
    //let accountBalanceDerived = 0.0;
    //blankAccount.balance = accountBalanceDerived;

    return Promise.resolve(this.accountRepository.findOne({ id: accountId }));
  }

  /**
   * FIXME
   * create a new account
   */
  public async createAccount(details: Partial<Account>): Promise<Account> {

    const newAcc = new Account();
    newAcc.name = details.name;
    newAcc.owner = details.owner;
    
    return Promise.resolve(this.accountRepository.save(newAcc));
  }

  /**
   * FIXME
   * update account details
   */
  public async updateAccount(accountId: string, changes: Partial<Account>): Promise<Account> {
    const accountToUpdate = await this.getAccount(accountId);
    
    for (let change in changes) {
      accountToUpdate[change] = changes[change];
    }
    
    return Promise.resolve(this.accountRepository.save(accountToUpdate));
  }

  /**
   * FIXME
   * delete account
   *
   * Requirements:
   * - Cascade and delete all transactions
   */
  public async deleteAccount(accountId: string): Promise<DeleteResult | void> {
    return Promise.resolve(this.accountRepository.delete(accountId));
  }
}

export default AccountManager;
