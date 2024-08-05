import {
  Handler,
  Middleware,
  RequestMapFunc,
  RequestMapper,
  RequestMethod,
  RequestTuple,
  RouteRequestMapper,
} from "../server/request";
import path from "path";
// import { encodeBase64 } from "../utils/base64";

export type RouterMeta = {
  globalPath: string;
  request: Map<String, Handler>;
  middlewares: Map<String, Middleware>;
};

export class Router implements RequestMethod {
  private readonly requestMap: RequestMapper;
  private readonly middlewares: Middleware[];
  private readonly requestMapFunc: RequestMapFunc;
  private localRequestMap: RouteRequestMapper = {};
  private localMiddlewares: Middleware[] = [];

  constructor(requestMap: RequestMapper, middlewares: Middleware[], requestMapFunc: RequestMapFunc) {
    this.requestMap = requestMap;
    this.requestMapFunc = requestMapFunc;
    this.middlewares = middlewares;
  }

  get(path: string, ...handlers: Handler[]) {
    this.delegate(path, "GET", handlers);
    return this
  }

  post(path: string, ...handlers: Handler[]) {
    this.delegate(path, "POST", handlers);
    return this
  }

  patch(path: string, ...handlers: Handler[]) {
    this.delegate(path, "PATCH", handlers);
    return this
  }

  options(path: string, ...handlers: Handler[]) {
    this.delegate(path, "OPTIONS", handlers);
    return this
  }

  put(path: string, ...handlers: Handler[]) {
    this.delegate(path, "PUT", handlers);
    return this
  }

  delete(path: string, ...handlers: Handler[]) {
    this.delegate(path, "DELETE", handlers);
    return this
  }

  head(path: string, ...handlers: Handler[]) {
    this.delegate(path, "HEAD", handlers);
    return this
  }

  use(middleware: Handler) {
    this.localMiddlewares.push(middleware);
    return this
  }

  attach(globalPath: string) {
    for (const k in this.localRequestMap) {
      const method = k;
      const reqArr: Array<RequestTuple> = this.localRequestMap[k];
      reqArr.forEach((v, _) => {
        this.requestMapFunc.apply(this, [method, path.join(globalPath, v.path), v.route.handler, v.route.middlewareFuncs]);
      });
    }
  }

  private delegate(localPath: string, method: string, handlers: Handler[]) {
    if (localPath === '/') {
      localPath = ''
    }

    if (handlers.length < 1) return;
    // Split the array
    const middlewares = handlers.slice(0, -1); // Array with all elements except the last one
    const handler = handlers[handlers.length - 1]; // Array with only the last element

    this.submitToMap(method.toLowerCase(), localPath, handler, middlewares);
  }

  private submitToMap(method: string, path: string, handler: Handler, middlewares: Middleware) {
    let targetMap: RequestTuple[] = this.localRequestMap[method];
    if (!targetMap) {
      this.localRequestMap[method] = [];
      targetMap = this.localRequestMap[method];
    }

    const route = {
      handler: handler,
      middlewareFuncs: middlewares,
    }

    targetMap.push({
      path,
      route,
    });
  }
}
