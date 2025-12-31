module.exports = {
    apps: [{
        name: 'framezlabs-erp',
        script: './server/dist/main.js',
        cwd: '/home/ubuntu/framezlabs-erp',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '800M',
        env: {
            NODE_ENV: 'production',
            PORT: 5003
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};
