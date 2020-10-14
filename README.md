# Sprint: Database ORM
### This was created during my time as a [Code Chrysalis](https://codechrysalis.io) Student

## 前置き

このプロジェクトは、今までのどのスプリントよりも複雑です。あなたが CC を卒業し、最初の仕事についた後、特定のタスクを処理をするように言われた時のシチュエーションを想定したものです。このスプリントがとても難しく感じるのは至って**当然**です。

以下はこのスプリント攻略の鍵です

- 大規模なプロジェクトでは、別のチームまたは開発者にプロジェクトの別々のタスクと部分で作業してもらう必要があるため、すべてを理解しようとする必要はなく、そんな時間は残業しまくらない限りありません（人生には遊びも大切です ✌️）。
- 特定のタスクに取り組むことになります。コードベースのどこで作業する必要があるかを優先的に見つけましょう。
- VSCode はあなたの Mate(友達）です。`Ctrl/ CMD + P`を使用してファイルをすばやく見つけ、「migration」などの用語を検索して、必要なものファイルなどを見つけるのに役立ちます
- あなたはすべてを知らなくても「まあいけるっしょ。」という姿勢を保つ必要があります。どんなに優秀な人でも全ては知りません。**とにかく手を動かして行きましょう**

## イントロダクション

ここまでで、（DDL を使用して）データベーススキーマを作成し、SQL を使用してリレーショナルデータベースのデータを（DML を使用して）操作することを勉強しました。ただし、データベースとアプリケーションのはまだ繋げていません。プログラムはデータベースとどのように繋がっているでしょうか？

このスプリントでは、経費管理アプリの実装で使うリレーショナルデータベースをそのアプリのビジネスロジックと統合します。実際の開発では、開発者が生の SQL ステートメントを書く代わりにオブジェクト関係マッピング（ORM）ライブラリを使用して、アプリケーションでのデータベースの使用の複雑さを抽象化するのが一般的です。

多くの ORM ライブラリでのリレーショナルデータベースマネジメントシステム（RDBMS）の概念とその表現のマッピングは、以下のとおりです。

| RDBMS の概念 | ORM での表現 　　     | 関連語彙　　 |
| ------------ | --------------------- | ------------ |
| schema       | collection of classes |              |
| table        | class                 | model        |
| row/record   | class instance        | model        |
| column       | class property        | field        |

ただし、ORM を使用しても「SQL は重要ではない」とは解釈されません。以下が理由です。

1. ほとんどの ORM ライブラリには、モデルで行われた変更を検出して移行を生成する機能が付属しています。生成された DDL は常に確認をしてください。そうしないと、データを失うリスクがあります。
2. 結合、集約、フィルタリング、バッチ処理など、database-part1 で学んだ概念は、ORM ライブラリを効率的に使用するために不可欠な知識です。
3. （ここは後に読んでも OK です）ORM ライブラリによって生成されたマイグレーションは、大規模なデータセットの場合、効率が低下する場合があります。移行中に RDBMS がテーブルレベルのロックを取得する可能性があります。テーブルのレコード数が膨大な場合、テーブルが長時間ロックされ、その結果、依存するサービスの可用性に影響を与える可能性があります。したがって、生成された SQL を手動で介入して最適化する必要がある場合があります。

## スプリントの目的

- オブジェクト関係マッピング（ORM）の概念を理解する
- データベースのマイグレーションを理解し、ORM でどのように動くかを理解する
- TypeScript で CRUD 操作をサポートする経費管理 API を構築する実践
- ORM を使用して複雑な操作（結合、集計、フィルタリングなど）を実行する実践
- (ボーナス)JWT と bcrypt を使用したユーザー認証の基本を理解する

## 環境設定

### Postgres

postgres をインストールする必要があります。まだインストールしていない場合は、[PostgresApp](https://postgresapp.com/)からダウンロードしてインストールし、ターミナルでコマンド `psql`を実行して、その動作を確認します。

#### データベース作成

1.　`psql`でログインし、expense_manager という名前でデータベースを新規に作成しましょう：

```
CREATE DATABASE expense_manager
```

2.　 `psql`でデータベースを切り替え、データベースが正しく作成されていることを確認します。

```
\c expense_manager
```

### `dotenv`を使用した環境変数を設定

データベースの準備ができたら、少し寄り道して環境変数について学習しましょう。環境変数は、プログラムの外部に存在する変数であり、特定の環境でグローバルにアクセスできます。アプリケーションの構成とクレデンシャル情報は、環境変数として保存される典型的な値です。

#### 環境変数の読み取り

環境変数のリストを表示するには、ノードシェルで`process.env`を実行します。

```
Welcome to Node.js v12.16.1.
Type ".help" for more information.

> process.env
{
  SHELL: '/bin/bash',
  HOME: '/home/melvin',
  USERNAME: 'melvin',
  ...
}
```

環境によっては、たくさんの値が表示されるはずです。これらは通常、オペレーティングシステムまたはユーザープログラムによって設定されます。

特定の環境変数を参照するには`DB_URL`であれば、`process.env.DB_URL`のように、`process.env`オブジェクトを介してアクセスすることだけです。

```
const DB_URL = process.env.DB_URL || "a default value"
```

#### 環境変数を使う

JavaScript と TypeScript では、環境変数を処理するために通常パッケージ `dotenv`が使用されます。環境変数の設定と読み取りには 3 つのステップがあります。

1. プロジェクトディレクトリに新しいファイル`.env`を作成し、すべての環境変数を記載します。

例

```
DB_NAME=expense_manager
DB_USER=eriko
DB_PASSWORD=eriko
DB_HOST=localhost
DB_PORT=5432
```

2. アプリの起動時に `.env`ファイルをロードします。ロードする方法はいくつかあります。

- [スクリプトを実行するときに `.env`をプリロードする](https://www.npmjs.com/package/dotenv#preload)：このアプリのスクリプトは、`.env`をプリロードするように設定されています。スクリプトは、`.env`で定義された変数にアクセスできる必要があります。

- [各ファイルのトップで `require（'dotenv').config()`を実行](https://www.npmjs.com/package/dotenv#usage)

  3.　アプリ内で、 `process.env`オブジェクトを介して変数を読み取ります。

```
console.log(process.env.DB_NAME)    // "expense_manager"
```

一般的な慣習として、すべての機密情報はハードコーディングするのではなく、環境変数で定義する必要があります。 `dotenv`を用い、アプリケーションの設定や認証情報を`package.json`と `.env`ファイルに保存します。 `.env`は`.gitignore`ファイルに追加し、決してコミットしないようにしてください。

### 依存関係のインストールの前に

Node v12（LTS）がインストールされ、アクティベートされていることを確認してください。

使用している node のバージョンを確認するコマンド:

```
node -v
```

###　依存関係のインストールとこのアプリの起動

コマンドの例：

依存関係のインストール:

```bash
yarn add bcrypt@^4.0
```

```bash
yarn install
```

データベースの設定が正しくセットアップされているかどうかを確認するために、下記のコマンドを実行してください:

```bash
yarn testConnection
```

テストの実行:

```bash
    yarn test
```

アプリを開発モードで実行:

```bash
    yarn dev
```

## 目的 & インストラクション

このスプリントの経費管理 API には以下の機能が付いています。

- ユーザー登録と認証の処理
- アカウントの CRUD 操作の処理
- トランザクション(取引）の CRUD 操作の処理（費用と収入の両方）

この経費管理 API は REST の原則に準拠して構築する必要があり、HTTP ステータスコード実装にに使用されています。主にコントローラー利用したり、TypeORM でデータベースと対話する `Manager`オブジェクトを実装します。

### 基本レベル

- [ ] 開発環境の準備ができていることを確認する

  - [ ] 依存関係をインストールする
  - [ ] `src/ormconfig.ts`に示されているデータベース認証情報で環境変数を更新するか、設定ファイルを直接変更する
  - [ ] `yarn dev`を実行し、サーバーが規定のポート（デフォルトは`5000`）でリッスンしていることを確認します
  - [ ] 準備完了！テストをパスすることに集中して欲しいため、とりあえず今はサーバーをシャットダウンしても 🆗。

- [ ] このようなスプリントの場合、プロジェクトの構造を理解するために、20〜30 分ほどかけることは普通です。ある程度時間はかけて構造把握をしましょう。取り組む上で特に次の点に特に注意してください。

  - [ ] `src/index.ts`がアプリのエントリーポイントである点
  - [ ] どのようにデータベースのクレデンシャル情報やアプリのコンフィグレーションがアプリに渡される点
  - [ ] [ビジネスロジック](https://ja.wikipedia.org/wiki/%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9%E3%83%AD%E3%82%B8%E3%83%83%E3%82%AF#:~:text=%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9%E3%83%AD%E3%82%B8%E3%83%83%E3%82%AF%EF%BC%88%E8%8B%B1%3A%20business%20logic,%E7%9A%84%E3%81%AA%E7%94%A8%E8%AA%9E%E3%81%A7%E3%81%82%E3%82%8B%E3%80%82&text=%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AB%E3%81%AF%E3%80%81%E3%82%A8%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%97%E3%83%A9%E3%82%A4%E3%82%BA,%E3%81%AB%E7%94%A8%E3%81%84%E3%82%8B%E7%94%A8%E8%AA%9E%E3%81%A7%E3%81%82%E3%82%8B%E3%80%82)が `src/services/*`および `src/entities`でにどのように分けられているかという点

- [ ] `entities`を見て、最初のマイグレーションを実行する

  - [ ] ほとんどの実際のアプリケーション、このスプリントも含め、全てのエンティティは**クラス**で表されま す。 `src/entities/*.ts`のすべてのエンティティを確認してください。部分的にしか実装されていないクラス もあり、残りはあなたが実装していきます。
  - [ ] `src/entities/UserModel.ts`で見たように、`User`モデルはすでに実装されています。また、最初 のマイグレーションも生成されています。 `src/migrations/*-CreateUser.ts`に移動して、生成されたマイグレーションがどのように行われるかを見てみましょう。
  - [ ] `yarn migrate` を使用して最初のマイグレーションを実行します
  - [ ] `user`テーブルがデータベースに作成されていることを確認してください。`psql`を使用して確認できま す。
  - [ ] テストをパスする

  - [ ] `yarn test`を使用してテストを実行すると、失敗したテストのリストが表示されます
  - [ ] `src/services/users/manager.ts`に移動し、`FIXME`を含むコメントのあるメソッドを探します。
    - [ ] `UserManager -> getUser()` の実装をし、それに関係したテストをパスする。
    - [ ] `UserManager -> updateUser()` の実装をし、それに関係したテストをパスする。
    - [ ] `UserManager -> removeUser()` の実装をし、それに関係したテストをパスする。
      > 💡 コツ 💡 　`UserController`ファイルと、`UserManager`ファイルで実装されているメソッドがどのように機能するかに着目する。
    - [ ] `src/tests/index.ts`に移動し、**Auth and user services** のテストから`.only（）`を削除する:
          `- describe.only("Auth and user services", () => { ... + describe("Auth and user services", () => { ...`

- [ ] シーディングを理解する

  - [ ] `src/seeds/createDummyUser.ts`に移動し、指示に従って、データベースにダミーユーザー`codechrysalis`を入れる

- [ ] コンフィグレーションファイルの意図を理解する

  - [ ] `src/ormconfig.ts`に移動し、ファイルの上部にあるコメントを読む

- [ ] 以下が完成した状態の`Account`および`Transaction`エンティティを表すクラス

  - ![実体関連モデル図](docs/images/erd.png)
  - [ ] `Account`と`Transaction`のモデルと関係性を定義する
    > 💡 コツ 💡 関連のあるエンティティーに`@OneToMany` がなくても`@ManyToOne`関係を定義できます([ソース](https://github.com/typeorm/typeorm/blob/master/docs/many-to-one-one-to-many-relations.md))
  - [ ] `yarn makeMigrations -n <MigrationName>`を使用して新しいマイグレーションファイルを作成する
  - [ ] 新しく生成された移行を適用する前に、作成された移行ファイルの SQL ステートメントが希望どおりであることを確認してください。そうでない場合は、ファイルを削除し、モデルを修正してから、再生成します。(**スタイルの修正以外に、生成されたマイグレーションを変更しないでください**)
  - [ ] `yarn migrate`を使用してマイグレーションを実行し,`psql`でデータベースを確認する。
  - [ ] (Optional)実行した移行をロールバックする必要がある場合は、TypeORM のドキュメントを参照して、 `package.json`にスクリプト`rollback`を定義してください

  - [ ] サービスコントローラーとサービスマネージャーのコードを全て書く.

  - [ ] 数分かけて、 `src/tests/index.ts`でそれぞれのコントローラーとマネージャーのテストケースに目を通してください。
    > 💡 コツ 💡 いつでも `.skip（）`または `.only（）`を使用して、実行するテストケースを指定できます
  - [ ] アカウントサービス（`src/services/ account/*.ts`)で`FIXME`のある場所を修正し、テ ストに合格する
    - [ ] コメントで指示されているように、 `AccountManager`のコンストラクターの行のコメン トを外します
    - [ ] `AccountManager -> getAccount()`を実装して、関連したテストをパスする
      > 💡 コツ 💡`account`テーブルと`transaction`テーブルの結合が必要です。
    - [ ] `AccountManager -> createAccount()` を実装して、関連したテストをパスする
    - [ ] `AccountManager -> updateAccount()` を実装して、関連したテストをパスする
    - [ ] `AccountManager -> deleteAccount()` を実装して、関連したテストをパスする
  - [ ] トランザクションサービス（`src/services/transaction/*.ts`）で`FIXME`のある場所を修正し、テストにパスする
    - [ ] コメントで指示されているように、 `TransactionManager`のコンストラクターの行のコメントを外します
    - [ ] `TransactionManager -> getTransaction()`を実装して、関連したテストをパスする
    - [ ] `TransactionManager -> createTransactiom()`を実装して、関連したテストをパスする
    - [ ] `TransactionManager -> deleteTransaction()`を実装して、関連したテストをパスする
    - [ ] `TransactionManager -> listTransactionsByIds()`を実装して、関連したテストをパスする
    - [ ] `TransactionManager -> listTransactionsInAccount()`を実装して、関連したテストをパスする
    - [ ] `TransactionManager -> filterTransactionsByAmountInAccount()`を実装して、関連したテストをパスする

- [ ] **参考資料**
      このスプリントはデータベース ORM に関するものですが、それだけではありません。このプロジェクトを実際のアプリケーションにさらに近づけるために、意図的に認証の基本をいくつか含めました。 Auth サービスを見て理解してみましょう
  - [ ] ユーザーの作成方法
  - [ ] [JWT トークン](https://jwt.io/introduction/)のユーザークレデンシャル情報を交換してユーザーがサインインする方法
  - [ ] ユーザーが取得した JWT トークンを使用して自分自身を認証する方法
  - [ ] `bcrypt`を使用してユーザー名とパスワードをデータベースに保存する方法
  - [ ] すべての `BaseControllerのサブクラス-> createRouter（）`メソッドに示されているように、 `src/authentication.ts-> guarded（）`関数を使用してユーザートークンをチェックする方法

### 上級レベル

- [ ] TypeORM でのデータベース接続の仕組みを理解する
  - [ ] `src/database.ts`に移動し、コードのコメントを読む
- [ ] 重複するサインアップをキャッチし、適切な HTTP ステータスコードを使用してエラーをユーザーに適切に提示するロジックを実装する
- [ ] API を実際のアプリケーションに近づけます。

  - [ ] このアプリでは、ユーザーが他のユーザーのデータにアクセスすることを許可するべきではありません。以下のテストケースから skip()を取り除き、テストをパスする
    - [ ] `'Auth and user services' -> 'should restrict access by unauthorised user'`
    - [ ] `'Account service' -> 'should restrict access by unauthenticated user'`
    - [ ] `'Account service' -> 'should restrict access by unauthorised user'`
    - [ ] `'Transaction service' -> 'should restrict access by unauthenticated user'`
    - [ ] `'Transaction service' -> 'should restrict access by unauthorised user'`
  - [ ] 削除要求を処理する場合、データベース内のレコードは削除されますが、テーブルの特別な列を使用て 「削除済み」としてマークするのが一般的です。この手法は「論理削除」と呼ばれます。インターネット荒野に 飛び込み、このトピックについて調査し、すべてのエンティティに実装してみましょう。
  - [ ] ユーザーがすべてのトランザクションレコード(取引記録）を CSV ファイルとしてダウンロードできるようにする新機能を実装する

## References

- [TypeORM：エンティティを理解する](https://typeorm.io/#/entities)
- [TypeORM: Advanced Options](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#advanced-options)
- [TypeORM: Many-To-One 関係を定義する](https://github.com/typeorm/typeorm/blob/master/docs/many-to-one-one-to-many-relations.md)
- [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#readme)
- [TypeScript における`this`](https://github.com/microsoft/TypeScript/wiki/%27this%27-in-TypeScript#use-instance-functions)
- [`@JoinColumn` options](https://orkhan.gitbook.io/typeorm/docs/relations#joincolumn-options)