/// <reference types="@cloudflare/workers-types" />

/** Bindings exposed by Cloudflare's Vite runtime module. */
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
  }
}
