
import { Pool } from 'pg';

const pool = new Pool({
  user: 'root',
  host: 'app.riviu.com.vn',
  database: 'meetly_dev',
  password: 'PJp6xBv29pnRUZO',
  port: 5432,
});

export default pool;
