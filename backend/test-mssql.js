const sql = require('mssql/msnodesqlv8');

const dbConfig = {
    server: 'localhost',
    database: 'TaskFlowDB',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('SUCCESS via mssql and dbConfig!');
        pool.close();
    })
    .catch(err => {
        console.error('FAILED via dbConfig:', err);
        
        // Let's try connection string
        const connString = 'server=localhost;Database=TaskFlowDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}';
        new sql.ConnectionPool({
            connectionString: connString
        }).connect().then(p => {
            console.log('SUCCESS via mssql and connectionString inside object!');
            p.close();
        }).catch(e => {
            console.error('FAILED via connectionString inside object:', e);
            
            // Try direct connection string
            new sql.ConnectionPool(connString).connect().then(p2 => {
                 console.log('SUCCESS via mssql direct connectionString!');
                 p2.close();
            }).catch(e2 => console.error('FAILED direct connection string:', e2));
        });
    });
