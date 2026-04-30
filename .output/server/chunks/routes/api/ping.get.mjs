import { c as defineEventHandler } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const ping_get = defineEventHandler(() => {
  return { status: "pong", time: (/* @__PURE__ */ new Date()).toISOString() };
});

export { ping_get as default };
//# sourceMappingURL=ping.get.mjs.map
