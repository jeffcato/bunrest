export class BunResponse {
    private response: Response;
    private options: ResponseInit = {};
    private subs: Array<any> = [];

    status(code: number): BunResponse {
      this.options.status = code;
      return this;
    }

    option(option: ResponseInit): BunResponse {
      this.options = Object.assign(this.options, option);
      return this;
    }

    statusText(text: string): BunResponse {
      this.options.statusText = text;
      return this;
    }

    json(body: any): void {
      const that = this
      that.response = Response.json(body, that.options);
      that.subs.filter(({type}) => type === 'finished')
        .forEach(({f}) => f(that.response))
    }

    send(body: any): void {
      const that = this
      that.response = new Response(body, that.options);
      that.subs.filter(({type}) => type === 'finished')
        .forEach(({f}) => f(that.response))
    }

    redirect(url: string, status: number = 302): void {
      const that = this
      that.response = Response.redirect(url, status);
      that.subs.filter(({type}) => type === 'finished')
        .forEach(({f}) => f(that.response))
    }

    // nodejs way to set headers
    setHeader(key: string, value: any) {
      if (!key || !value) {
          throw new Error('Headers key or value should not be empty');
      }

      const headers = this.options.headers;
      if (!headers) {
          this.options.headers = { keys: value };
      }
      this.options.headers[key] = value;
      return this;
    }

    // nodejs way to get headers
    getHeader() {
      return this.options.headers;
    }

    headers(header: HeadersInit): BunResponse {
      this.options.headers = header;
      return this;
    }

    getResponse(): Response {
      return this.response;
    }

    isReady(): boolean {
      return !!this.response;
    }

    on(type, f): Response {
      this.subs.push({type, f})
      return this
    }
}
