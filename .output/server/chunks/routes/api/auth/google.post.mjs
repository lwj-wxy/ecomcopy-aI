import { c as defineEventHandler, r as readBody, e as createError, f as setCookie } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const google_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { idToken } = body;
  if (!idToken) {
    throw createError({
      statusCode: 400,
      message: "\u7F3A\u5C11\u8BA4\u8BC1\u4EE4\u724C"
    });
  }
  setCookie(event, "auth_token", idToken, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });
  return {
    success: true
  };
});

export { google_post as default };
//# sourceMappingURL=google.post.mjs.map
