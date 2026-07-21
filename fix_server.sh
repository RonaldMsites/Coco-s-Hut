#!/bin/bash
sed -i 's/async function startServer() {/const app = express();\nasync function startServer() {/g' server.ts
sed -i 's/  const app = express();//g' server.ts
