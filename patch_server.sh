#!/bin/bash
sed -i "s/} else {/} else if (\!process.env.VERCEL) {/g" server.ts
