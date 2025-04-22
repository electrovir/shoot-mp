# Server setup for multiplayer gaming

## Initial server setup steps with AWS Lightsail

1. Create a Nginx Lightsail instance on AWS.
2. Create and/or attach a static IPv4 address (in the networking tab of your instance).
3. Download the default SSH key.
4. Move the default SSH key into `~/.ssh/`.
5. Fix the default SSH key's permissions: `chmod 400 ~/.ssh/<key-name>.pem`.
6. Add the host to `~/.ssh/config`:
    ```
    Host <connection-name>
        HostName <static-ip-address>
        User bitnami
        AddKeysToAgent yes
        UseKeychain yes
        IdentitiesOnly yes
        IdentityFile ~/.ssh/<key-name>.pem
    ```
7. SSH with key forwarding into the server: `ssh -A <connection-name>`.
8. Create a repos folder: `sudo mkdir /opt/bitnami/repos/`.
9. Change ownership to current user: `sudo chown $USER /opt/bitnami/repos/`.
10. Create a symlink to it for easier access: `ln -s /opt/bitnami/repos/ ~/repos`.
11. Kill the default http service:
    ```sh
    sudo /opt/bitnami/ctlscript.sh stop
    ```
12. Disable the default http service:
    ```sh
    sudo update-rc.d bitnami disable
    ```
13. Update packages with `apt`:
    ```sh
    sudo apt update
    sudo apt upgrade
    sudo apt clean
    sudo apt autoremove
    sudo reboot
    ```
14. Install and setup Starship:
    - https://github.com/starship/starship?tab=readme-ov-file
    - https://electrovir.com/2024-08-29-awesome-terminal#informative-and-personalized-prompt
    - use this icon: 
    - use color [214](https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit)
    - run `source ~/.bashrc` after modifying the config
15. Setup ufw with steps from https://electrovir.com/2024-12-30-nginx-pi/#setup-a-firewall.
    - Just use `sudo ufw allow <PORT>` instead of worrying about `from` or `to`
    - Enable ports `22`, `80`, and `443`.
16. Point DNS at the static IP from your domain registrar with a new `A` record.
17. Configure an SSL certificate:
    - `sudo /opt/bitnami/bncert-tool`
    - https://docs.bitnami.com/general/how-to/generate-install-lets-encrypt-ssl/
18. Disable all default `.conf` files in `/opt/bitnami/nginx/conf/bitnami/` and `/opt/bitnami/nginx/conf/server_blocks/` by adding `.disabled` to the end of them.
19. Restart nginx with `sudo /opt/bitnami/ctlscript.sh restart nginx`.
20. Install nvm: https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating.
21. Run `source ~/.bashrc`.
22. Run `nvm install 22` (or whatever is the latest LTS version that we support).
23. Run `npm i -g npm@latest`.
24. Clone the repo into `repos`.
25. Setup pm2:
    1. Run `npm i -g pm2`.
    2. Run `pm2 startup`.
    3. Run the command that step 2 tells you to run.
    4. `cd` into the repo.
    5. Follow the ["Update each time"](#update-each-time) section until the "restart pm2" step.
    6. `cd` into `packages/backend`.
    7. Run `pm2 start npm -- start`.
    8. Run `pm2 save`.

## Update each time

Run these steps each time the server code needs to be updated.

1. Run `npm ci`.
2. Run `npm run build:backend`.
3. Restart pm2: `pm2 restart all`
