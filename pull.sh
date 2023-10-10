#!/bin/sh
sudo git stash && sudo git pull && sudo pm2 stop server && sudo pm2 start server