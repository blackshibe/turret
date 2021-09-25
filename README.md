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

then, add an .ENV file:

```
DB_CONLIMIT=50
DB_HOST=localhost
DB_USER=blackshibe
DB_PASSWORD=
DB_DATABASE=passwords
SECRET=somefuckingsecretidk
```

and run:

```
git clone https://github.com/blackshibe/turret
cd turret
npm install
npm run debug
```
