#!/bin/bash
sed -i 's/const vite = await createViteServer({/const { createServer: createViteServer } = await import("vite");\n    const vite = await createViteServer({/g' server.ts
