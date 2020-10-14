import App, { getDefaultApp } from "./app";
import DatabaseConnectionManager from "./database";

const APP_SECRET = process.env.APP_SECRET || "5s5seA2~JaFq'#%x}pN9iD@Sv+^bD7K,qf}9<VvwaXzyuDj@ez%xWmtr27Aikz1";

DatabaseConnectionManager.connect().then(() => {
  const app: App = getDefaultApp(APP_SECRET);
  app.start();
});
