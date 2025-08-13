module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify({
      ok: true,
      ts: Date.now(),
      uptimeSec: process.uptime(),
      pid: process.pid
    })
  };
};