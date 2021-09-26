# Turret

Expressjs project built to track errors in production applications.

# Configuration

Configure the MySQL database:

```
CREATE DATABASE turret;
USE turret;
CREATE TABLE accounts(userid INT NOT NULL AUTO_INCREMENT, username VARCHAR(60) NOT NULL, password VARCHAR(60) NOT NULL, PRIMARY KEY ( userid ));
DESCRIBE accounts;
```

Desired result:

```
+----------+-------------+------+-----+---------+----------------+
| Field    | Type        | Null | Key | Default | Extra          |
+----------+-------------+------+-----+---------+----------------+
| userid   | int(11)     | NO   | PRI | NULL    | auto_increment |
| username | varchar(60) | NO   |     | NULL    |                |
| password | varchar(60) | NO   |     | NULL    |                |
+----------+-------------+------+-----+---------+----------------+
```

then, add an .env file:

```
DB_HOST=your host
DB_USER=your user
DB_PASS=your password
SECRET=your secret

ADMIN_USER=admin
ADMIN_PASS=admin
```

and run:

```
git clone https://github.com/blackshibe/turret
cd turret
npm install
npm run debug
```

.spy is a file extension specifically to allow expressjs to render via the `render` function. use HTML highlighting.
