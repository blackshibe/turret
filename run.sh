lsof -i tcp:8000 -F|grep -i -E -o 'p[[:digit:]]+'|grep -iEo '[[:digit:]]+'|xargs kill || echo no processes to kill
nodemon out/server/index.js & tsc -watch