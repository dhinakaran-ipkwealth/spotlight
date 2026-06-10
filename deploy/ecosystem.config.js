// PM2 process file for the IPK feedback backend (NestJS) and frontend (Next.js).
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ipk-feedback-backend',
      cwd: __dirname + '/../backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'ipk-feedback-frontend',
      cwd: __dirname + '/../frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4001',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
