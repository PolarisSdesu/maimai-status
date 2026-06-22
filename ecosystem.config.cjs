module.exports = {
  apps: [
    {
      name: "maimai-update",
      script: "build/index.js",
      cwd: "/home/polariss/maimai-update",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
