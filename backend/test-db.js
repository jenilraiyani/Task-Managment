const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'DESKTOP-B0I1J40',
    database: 'TaskFlowDB',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

console.log('Testing SQL Server...');
console.log('Server:', config.server);
console.log('Database:', config.database);

sql.connect(config)
    .then(pool => {
        console.log('✅ CONNECTED!');

        return pool.request().query(`
            SELECT
                @@SERVERNAME AS ServerName,
                DB_NAME() AS DatabaseName,
                SYSTEM_USER AS UserName
        `);
    })
    .then(result => {
        console.log('Result:', result.recordset);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILED');
        console.dir(err, { depth: 10 });
        process.exit(1);
    });
