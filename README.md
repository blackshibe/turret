# Turret

Expressjs project built to track errors in production applications.

# Configuration

Configure the MySQL database:

```
create database turret;
use turret;

create table accounts(
    user INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL,
    PRIMARY KEY ( user )
);

create table issues(
    issueid INT NOT NULL AUTO_INCREMENT,
    time TIMESTAMP NOT NULL,
    content VARCHAR(256) NOT NULL,

    PRIMARY KEY (issueid)
);

create table events(
    eventid INT NOT NULL AUTO_INCREMENT,
    issueid INT NOT NULL,
    user INT NOT NULL,
    time TIMESTAMP NOT NULL,

    PRIMARY KEY (eventid),
    FOREIGN KEY (issueid) REFERENCES issues(issueid)
);

```

Desired result:

```
accounts
------------------------------------------------------------------
| Field    | Type        | Null | Key | Default | Extra          |
------------------------------------------------------------------
| user   | int(11)     | NO   | PRI | NULL    | auto_increment |
| username | varchar(60) | NO   |     | NULL    |                |
| password | varchar(60) | NO   |     | NULL    |                |
------------------------------------------------------------------
issues
-----------------------------------------------------------------------------------------
| Field   | Type         | Null | Key | Default           | Extra                       |
-----------------------------------------------------------------------------------------
| issueid | int(11)      | NO   | PRI | NULL              | auto_increment              |
| time    | timestamp    | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| content | varchar(256) | NO   |     | NULL              |                             |
-----------------------------------------------------------------------------------------
events
--------------------------------------------------------------------------------------
| Field   | Type      | Null | Key | Default           | Extra                       |
--------------------------------------------------------------------------------------
| eventid | int(11)   | NO   | PRI | NULL              | auto_increment              |
| issueid | int(11)   | NO   | MUL | NULL              |                             |
| time    | timestamp | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
| user  | int(11)   | NO   |     | NULL              |                             |
--------------------------------------------------------------------------------------

```

then, add an .env file:

```
DB_HOST=your host
DB_USER=your user
DB_PASS=your password
SECRET=your secret

ADMIN_USER=admin
ADMIN_PASS=admin
^ these 2 are only needed for a first time run;
^ best to remove them after you log-in
```

and run:

```
git clone https://github.com/blackshibe/turret
cd turret
npm install
npm run debug
```

.spy is a file extension specifically to allow expressjs to render via the `render` function. use HTML highlighting.
