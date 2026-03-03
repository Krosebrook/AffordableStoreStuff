import { app, initApp } from "../server/index";

const ready = initApp();

export default async function handler(req: any, res: any) {
  await ready;
  app(req, res);
}
