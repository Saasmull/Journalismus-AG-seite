#!/bin/sh
sudo rm -r * && sudo git stash && sudo git pull --rebase && sudo pm2 stop server && sudo pm2 start server