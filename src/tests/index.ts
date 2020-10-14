/**
 * Disclaimer
 *
 * You will notice these test cases are verbose,
 * and can sometimes be refactored and broken down
 * to smaller functions. However, for the sake of
 * learning, and given the complexity of this sprint,
 * test cases here will be as verbose as possible to
 * give you a clear trail of what these tests are trying
 * to achieve
 */
import "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import { Application } from "express";
import { getRepository, Repository, Not, IsNull } from "typeorm";
import { v4 as uuid4 } from "uuid";
import DatabaseConnectionManager from "../database";
import { getDefaultApp } from "../app";
import User from "../entities/UserModel";
import Transaction from "../entities/TransactionModel";
import Account from "../entities/AccountModel";
import TransactionManager from "../services/transactions/manager";

chai.use(chaiHttp);

const expect = chai.expect;

describe("expense manager", () => {
  const APP_SECRET = "xxxyyyxxxyyy";
  const TEST_USER_ID = "3461cac2-35bd-4d45-a163-f220beb43d76";
  const TEST_ACCOUNT_ID = "655f6179-543f-45e7-a4ae-69bd9f179c52";

  let app: Application;
  let userRepo: Repository<User>;
  let accountRepo: Repository<Account>;
  let transactionRepo: Repository<Transaction>;

  /**
   * Sign in with test user and obtain a JWT token
   * username: tester
   * password: tester
   */
  async function signInAndGetToken(): Promise<string> {
    const signInResponse = await chai.request(app).post("/token").send({ username: "tester", password: "tester" });

    return signInResponse.body.accessToken;
  }

  before(async () => {
    await DatabaseConnectionManager.connect();

    app = getDefaultApp(APP_SECRET).app;
    userRepo = getRepository(User);
  });

  after(async () => {
    await userRepo.delete({ id: Not(IsNull()) });
  });

  beforeEach(async () => {
    /**
     * Restore our test user
     * username: tester
     * password: tester
     */
    let testUser = new User();
    testUser.id = TEST_USER_ID;
    testUser.username = "tester";
    testUser.passwordHash = "$2b$10$g4T0eDtJUoYWkyhNnA9X5OF667.l23GNc9hHro5OCkAFQPJRktf5u";
    testUser = await userRepo.save(testUser);

    /**
     * Advanced Requirements:
     * - Create and use a dedicated test database
     */
  });

  describe("Auth and user services", () => {
    it("should restrict access by unauthenticated user", async () => {
      const res = await chai.request(app).get(`/users/${TEST_USER_ID}`);
      expect(res).to.have.status(401);
    });

    it.skip("should restrict access by unauthorised user", async () => {
      /**
       * Advanced requirement:
       * - Users should not be able to access others' data
       */

      // Sign in
      const accessToken: string = await signInAndGetToken();

      // Trying to other's profile
      // "6fb61907-2fab-48d3-80ae-276a28ba4c2f" is a random userId, which may or may not exist in our DB
      // Our API should restrict access by non-owner
      const getUserResponse = await chai
        .request(app)
        .get(`/users/6fb61907-2fab-48d3-80ae-276a28ba4c2f`)
        .set("Authorization", accessToken);

      expect(getUserResponse).to.have.status(403);
    });

    it("should be able to create users as an unauthenticated user", async () => {
      /**
       * Advanced requirements:
       * - Make sure duplicate sign-up is caught
       */
      const response = await chai.request(app).post("/users").send({ username: "melvin", password: "melvin" });
      const { id, passwordHash } = response.body;
      expect(response).to.have.status(201);

      expect(id).to.be.not.null;

      // Ensure password-related fields are inaccessible by users
      expect(passwordHash).to.be.undefined;
    });

    it("should be able to retrieve a user", async () => {
      const accessToken: string = await signInAndGetToken();
      const res = await chai.request(app).get(`/users/${TEST_USER_ID}`).set("Authorization", accessToken);

      expect(res).to.have.status(200);

      const { id, username, passwordHash, password } = res.body;
      expect(id).to.be.equals(TEST_USER_ID);
      expect(username).to.be.equals("tester");

      // Ensure password-related fields are inaccessible by users
      expect(passwordHash).to.be.undefined;
      expect(password).to.be.undefined;
    });

    it("should be able to update a user", async () => {
      const accessToken: string = await signInAndGetToken();

      const user = await userRepo.findOne(TEST_USER_ID);

      // The actual value of newDisplayName doesn't really matter
      // What we care about is the right behaviour
      const newDisplayName = `${user.displayName}${uuid4()}`;

      const updateUserResponse = await chai
        .request(app)
        .patch(`/users/${TEST_USER_ID}`)
        .set("Authorization", accessToken)
        .send({ displayName: newDisplayName });

      // Assert latest data is returned
      expect(updateUserResponse.body.displayName).to.be.equals(newDisplayName);

      // Assert database is properly updated too
      const updatedUser = await userRepo.findOne(TEST_USER_ID);
      expect(updatedUser.displayName).to.be.equals(newDisplayName);
    });

    it("should be able to remove a user", async () => {
      /**
       * This doesn't test if the user has indeed been removed
       * from database table to allow room for implementing
       * soft deletion
       *
       * FIXME
       * Advanced Requirements
       * - Implement soft deletion
       */
      const accessToken: string = await signInAndGetToken();

      // Delete
      const deleteResponse = await chai.request(app).delete(`/users/${TEST_USER_ID}`).set("Authorization", accessToken);
      expect(deleteResponse).to.have.status(200);

      // Try to retrieve after delete
      const getResponse = await chai.request(app).get(`/users/${TEST_USER_ID}`).set("Authorization", accessToken);
      expect(getResponse).to.have.status(404);
    });
  });

  const createNewAccount = async () => {
    /**
     * Restore our test account
     * 
     * [1] https://typeorm.io/#/relations-faq/how-to-use-relation-id-without-joining-relation
     */
    const newAccount = new Account();
    newAccount.id = TEST_ACCOUNT_ID;
    newAccount.name = "tester coin pouch";
    newAccount.owner = await userRepo.findOne(TEST_USER_ID);  // Alternatively, use [1]
    await accountRepo.save(newAccount);
  }

  describe("Account service", () => {
    before(() => {
      accountRepo = getRepository(Account);
      transactionRepo = getRepository(Transaction);
    });

    after(async () => {
      await transactionRepo.delete({ id: Not(IsNull()) });
      await accountRepo.delete({ id: Not(IsNull()) });
    });

    beforeEach(createNewAccount);

    it.skip("should restrict access by unauthenticated user", async () => {
      /**
       * FIXME
       *
       * Advanced requirements
       * - Make sure unauthenticated users are not allowed to
       *   create account, nor accessing accounts data
       */
    });

    it.skip("should restrict access by unauthorised user", async () => {
      /**
       * FIXME
       *
       * Advanced requirements
       * - Make sure unauthorised users are not allowed to access others' accounts
       */
    });

    it("should be able to create accounts", async () => {
      const accessToken = await signInAndGetToken();
      const res = await chai
        .request(app)
        .post("/accounts")
        .set("Authorization", accessToken)
        .send({ name: "My Piggy Bank" });

      expect(res).to.have.status(201);

      const { id, name, owner } = res.body;

      expect(id).to.be.not.null;
      expect(name).to.be.equals("My Piggy Bank");
      expect(owner.id).to.be.equals(TEST_USER_ID);

      // Test record in database
      const account = await accountRepo.findOneOrFail(id);
      expect(account.id).to.equals(id);
      expect(account.name).to.equals(name);
    });

    it("should be able to retrieve an account", async () => {
      // Remember we have a beforeEach hook that
      // restore our default test account :)
      const accessToken: string = await signInAndGetToken();
      const res = await chai.request(app).get(`/accounts/${TEST_ACCOUNT_ID}`).set("Authorization", accessToken);

      expect(res).to.have.status(200);

      const { id, name } = res.body;
      expect(id).to.be.equals(TEST_ACCOUNT_ID);
      expect(name).to.be.equals("tester coin pouch");
    });

    it("should be able to update an account", async () => {
      const accessToken = await signInAndGetToken();
      const res = await chai
        .request(app)
        .patch(`/accounts/${TEST_ACCOUNT_ID}`)
        .set("Authorization", accessToken)
        .send({ name: "My Pink Piggy Bank" });

      expect(res).to.have.status(200);

      // Assert response
      const { id, name } = res.body;
      expect(id).to.be.equals(TEST_ACCOUNT_ID);
      expect(name).to.be.equals("My Pink Piggy Bank");

      // Assert database record
      const account = await accountRepo.findOneOrFail(TEST_ACCOUNT_ID);
      expect(account.name).to.be.equals("My Pink Piggy Bank");
    });

    it("should be able to delete an account", async () => {
      /**
       * This doesn't test if the account  has indeed been
       * removed from database table to allow room for
       * implementing soft deletion
       *
       * Advanced Requirements
       * - Implement soft deletion
       */
      const accessToken: string = await signInAndGetToken();

      const deleteResponse = await chai
        .request(app)
        .delete(`/accounts/${TEST_ACCOUNT_ID}`)
        .set("Authorization", accessToken);
      expect(deleteResponse).to.have.status(200);

      const getResponse = await chai.request(app).get(`/accounts/${TEST_ACCOUNT_ID}`).set("Authorization", accessToken);
      expect(getResponse).to.have.status(404);
    });

    it("should be able to cascade delete transactions", async () => {
      const createDummyData = async () => {
        let newAccount = new Account();
        newAccount.id = "12eb75b6-bdee-4e12-a86d-844736579e98";
        newAccount.name = "My Third Account";
        newAccount.owner = await userRepo.findOne(TEST_USER_ID);
        newAccount = await accountRepo.save(newAccount);

        const transactions = await transactionRepo.insert([
          {
            id: "456bf5d9-1023-4af7-840d-6cfb54130fb5",
            account: newAccount,
            transactionDate: new Date(),
            amount: -110.0,
            description: "Snacks from Hyaku-en store",
          },
          {
            id: "97b7a572-e723-4e25-8c15-cfc507ef38f5",
            account: newAccount,
            transactionDate: new Date(),
            amount: -699.0,
            description: "Tonkotsu ramen",
          },
          {
            id: "331f9fc4-df0e-47d1-ad51-a6e57cd07521",
            account: newAccount,
            transactionDate: new Date(),
            amount: 98000.0,
            description: "Refund from airline",
          },
        ]);
      };

      const removeDummyData = async () => {
        await transactionRepo.delete([
          "331f9fc4-df0e-47d1-ad51-a6e57cd07521",
          "97b7a572-e723-4e25-8c15-cfc507ef38f5",
          "456bf5d9-1023-4af7-840d-6cfb54130fb5",
        ]);
        await accountRepo.delete("12eb75b6-bdee-4e12-a86d-844736579e98");
      };

      try {
        const accessToken: string = await signInAndGetToken();

        // Create a new account and a bunch of transactions
        await createDummyData();

        // Delete account and make sure it's cascading
        const deleteResponse = await chai
          .request(app)
          .delete("/accounts/12eb75b6-bdee-4e12-a86d-844736579e98")
          .set("Authorization", accessToken);
        expect(deleteResponse).to.have.status(200);

        const getTransactionResponse = await chai
          .request(app)
          .get("/transactions/456bf5d9-1023-4af7-840d-6cfb54130fb5")
          .set("Authorization", accessToken);
        expect(getTransactionResponse).to.have.status(404);
      } catch (err) {
        await removeDummyData();
        throw err;
      }
    });
  });

  describe("Transaction service", () => {
    before(() => {
      accountRepo = getRepository(Account);
      transactionRepo = getRepository(Transaction);
    });

    after(async () => {
      await transactionRepo.delete({ id: Not(IsNull()) });
      await accountRepo.delete({ id: Not(IsNull()) });
    });

    beforeEach(createNewAccount);

    it.skip("should restrict access by unauthenticated user", async () => {
      /**
       * FIXME
       *
       * Advanced requirements
       * - Make sure unauthenticated users are not allowed to
       *   create nor accessing trasaction data
       */
    });

    it.skip("should restrict access by unauthorised user", async () => {
      /**
       * FIXME
       *
       * Advanced requirements
       * - Make sure unauthorised users are not allowed to access others' accounts
       */
    });

    it("should be able to create and retrieve a transaction", async () => {
      /**
       * Requirements:
       * - A transaction can only be created if there
       *   is an existing account
       */
      const accessToken = await signInAndGetToken();

      const createResponse = await chai.request(app).post("/transactions").set("Authorization", accessToken).send({
        accountId: TEST_ACCOUNT_ID,
        amount: -2500.0,
        transactionDate: new Date(),
        description: "electricity bill",
      });
      expect(createResponse).to.have.status(201);

      const { id } = createResponse.body;
      const getResponse = await chai.request(app).get(`/transactions/${id}`).set("Authorization", accessToken);
      expect(getResponse).to.have.status(200);

      const { account, amount, transactionDate, description } = getResponse.body;
      expect(account.id).to.equals(TEST_ACCOUNT_ID);
      expect(amount).to.equals(-2500.0);
      expect(transactionDate).to.be.not.null;
      expect(description).to.equals("electricity bill");
    });

    it("should be able to update a transaction", async () => {
      const accessToken = await signInAndGetToken();
      const createResponse = await chai.request(app).post("/transactions").set("Authorization", accessToken).send({
        accountId: TEST_ACCOUNT_ID,
        amount: -10230.0,
        transactionDate: new Date(),
        description: "1.2kg of", // Opps, we have a typo
      });
      expect(createResponse).to.have.status(201);

      const { id } = createResponse.body;
      const updateResponse = await chai
        .request(app)
        .patch(`/transactions/${id}`)
        .set("Authorization", accessToken)
        .send({ description: "1.2kg of shrimps" });
      expect(updateResponse).to.have.status(200);

      const { description } = updateResponse.body;
      expect(description).to.equals("1.2kg of shrimps");
    });

    it("should be able to delete a transaction", async () => {
      const accessToken = await signInAndGetToken();
      const createResponse = await chai.request(app).post("/transactions").set("Authorization", accessToken).send({
        accountId: TEST_ACCOUNT_ID,
        amount: -390.0,
        transactionDate: new Date(),
        description: "Daruma doll",
      });
      expect(createResponse).to.have.status(201);

      const { id } = createResponse.body;

      // Delete
      const deleteResponse = await chai.request(app).delete(`/transactions/${id}`).set("Authorization", accessToken);
      expect(deleteResponse).to.have.status(200);

      // Try to retrieve after delete
      const getResponse = await chai.request(app).post(`/transactions/${id}`).set("Authorization", accessToken);
      expect(getResponse).to.have.status(404);
    });
  });

  describe("Transaction manager", () => {
    const TRANSACTION_MANAGER_TEST_ACCOUNT_ID = "";
    let transactionManager: TransactionManager;

    before(() => {
      accountRepo = getRepository(Account);
      transactionRepo = getRepository(Transaction);
    });

    after(async () => {
      await transactionRepo.delete({ id: Not(IsNull()) });
      await accountRepo.delete({ id: Not(IsNull()) });
    });

    beforeEach(async () => {
      transactionManager = new TransactionManager();

      // restore our test account
      const owner = await userRepo.findOne(TEST_USER_ID);
      await accountRepo.save([
        {
          id: "c75507c7-c24c-4e3a-b15d-adedcc244b42",
          name: "Transaction manager tester account A",
          owner,
        },
        {
          id: "dd22fe05-e07f-4351-a645-f7bfe4e902de",
          name: "Transaction manager tester account B",
          owner,
        },
      ]);

      // restore our transactions
      await transactionRepo.save([
        // Account A
        {
          id: "561d6053-4f08-42ac-9a4f-a3d91c7d7760",
          account: { id: "c75507c7-c24c-4e3a-b15d-adedcc244b42" },
          amount: -200.0,
          transactionDate: new Date(),
          description: "potato chips",
        },
        {
          id: "d8ba92d1-a830-4d10-95ea-e2fdf7a27997",
          account: { id: "c75507c7-c24c-4e3a-b15d-adedcc244b42" },
          amount: -20000.0,
          transactionDate: new Date(),
          description: "cooking gears",
        },
        {
          id: "ea4758dc-3805-4269-b94e-d35f2768f170",
          account: { id: "c75507c7-c24c-4e3a-b15d-adedcc244b42" },
          amount: -1200.0,
          transactionDate: new Date(),
          description: "coffee",
        },
        // Account B
        {
          id: "32ef18d3-dade-4966-a089-43ff9a52eb73",
          account: { id: "dd22fe05-e07f-4351-a645-f7bfe4e902de" },
          amount: -110.0,
          transactionDate: new Date(),
          description: "hyaku-en store notebook",
        },
      ]);
    });

    it("list transactions in account", async () => {
      /**
       * Test subject: TransactionManager -> listTransactionsInAccount
       */
      const transactions = await transactionManager.listTransactionsInAccount("c75507c7-c24c-4e3a-b15d-adedcc244b42");
      expect(transactions).to.have.length(3);
      const transactionIds = transactions.map((t) => t.id);
      expect(transactionIds).to.have.deep.members([
        "561d6053-4f08-42ac-9a4f-a3d91c7d7760",
        "d8ba92d1-a830-4d10-95ea-e2fdf7a27997",
        "ea4758dc-3805-4269-b94e-d35f2768f170",
      ]);
    });

    it("list transactions by ids", async () => {
      /**
       * Test subject: TransactionManager -> listTransactionsByIds
       */
      const transactions = await transactionManager.listTransactionsByIds([
        "d8ba92d1-a830-4d10-95ea-e2fdf7a27997",
        "32ef18d3-dade-4966-a089-43ff9a52eb73",
      ]);

      expect(transactions).to.have.length(2);
      transactions.forEach((transaction) => {
        expect(transaction).to.have.property("id");
        expect(transaction).to.have.nested.property("account.id");
        expect(transaction).to.have.nested.property("account.name");
      });
    });

    it("list transactions in account which amounts less than a particular number", async () => {
      /**
       * Test subject: TransactionManager -> filterTransactionsByAmountInAccount
       */
      const transactions = await transactionManager.filterTransactionsByAmountInAccount(
        /* Account ID */ "c75507c7-c24c-4e3a-b15d-adedcc244b42",
        /* Expenses less than 10000.00 unit u*/ 10000.0,
      );
      transactions.forEach((transaction) => {
        expect(transaction.account.id).to.be.equals("c75507c7-c24c-4e3a-b15d-adedcc244b42");
        expect(transaction.amount).to.be.lessThan(10000.0);
      });
    });
  });
});
