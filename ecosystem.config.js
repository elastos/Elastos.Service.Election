module.exports = {
  apps: [{
    name: 'DposNodeRPC',
    script: 'bin/www',
    instances: 1,
    autorestart: true,
    watch: ['bin', 'constant', 'routes', 'service', 'views', 'schedule', 'util', 'app.js', 'init'],
    watch_delay: 16000,
    ignore_watch: ['node_modules', 'public', 'python', 'data.db', 'logs'],
    watch_options: {
      'followSymlinks': false
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    cron_restart: '6 6 * * *',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
