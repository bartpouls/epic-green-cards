#!/bin/bash
f=$1; b=$(basename $f .json)
timeout 60 node mutrun.js $f 0 1 s2/$b.out.json >/dev/null 2>&1 || echo '[{"i":0,"gedood":true,"reden":"timeout/crash"}]' > s2/$b.out.json
