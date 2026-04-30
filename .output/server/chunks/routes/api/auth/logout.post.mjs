import { c as defineEventHandler, g as deleteCookie } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const logout_post = defineEventHandler(async (event) => {
  deleteCookie(event, "auth_token", {
    path: "/"
  });
  console.log("Server: Session cleared from Redis (simulated)");
  return {
    success: true,
    message: "\u5DF2\u9000\u51FA\u767B\u5F55"
  };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
