#!/bin/sh
sudo -r rm * && sudo git stash && sudo git pull --rebase && sudo pm2 stop server && sudo pm2 start server