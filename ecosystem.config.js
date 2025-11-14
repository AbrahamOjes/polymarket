/**
 * PM2 Ecosystem Configuration
 * Keeps agent server and monitor running 24/7
 */

module.exports = {
  apps: [
    {
      name: 'epl-agent-server',
      script: './agent-server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/agent-server-error.log',
      out_file: './logs/agent-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    {
      name: 'epl-opportunity-monitor',
      script: './agent-monitor.js',
      args: '300000 10 70 false', // 5min interval, 10% min edge, 70% confidence, no auto-trade
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/monitor-error.log',
      out_file: './logs/monitor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      cron_restart: '0 */6 * * *' // Restart every 6 hours for fresh state
    }
  ]
};
