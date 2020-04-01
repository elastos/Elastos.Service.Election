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
    env: {},
    env_development: {
      NODE_ENV: 'development',
      DID_RESOLVER: 'http://api.elastos.io:22606',
      RPC_IP: '127.0.0.1',
      RPC_PORT: '22336',
      RPC_PATH: '/'
    },
    env_test: {
      NODE_ENV: 'test',
      DID_RESOLVER: 'http://api.elastos.io:21606',
      RPC_IP: '127.0.0.1',
      RPC_PORT: '21336',
      RPC_PATH: '/'
    },
    env_production: {
      NODE_ENV: 'production',
      DID_RESOLVER: 'http://api.elastos.io:20606',
      RPC_PORT: '20336',
      RPC_PATH: '/'
    }
  }]
};
