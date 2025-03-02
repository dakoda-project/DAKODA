## 🚀 Ways to Deploy the Eleventy Site on the University Server
Deployment methods for the Eleventy-based DAKODA site on a university-managed server. Here are the different ways to achieve this:
### 🏗 **1️⃣  Manual Deployment via SFTP**
If the university provides an FTP/SFTP server, you can manually upload the generated _site/ directory.

Steps:
1. Build the site locally:
```
npx eleventy
```
This will generate the site inside the _site/ folder.

2. Connect to the university server via an SFTP client (e.g., FileZilla, WinSCP, Cyberduck).
Server: sftp://your-university-server.edu
Username: (Your university-provided username)
Password: (Or SSH key-based authentication)

3. Navigate to the web directory on the university server (e.g., /var/www/html/dakoda).
   
4. Upload the _site/ folder contents to this directory.

5. Access the site via the university domain (e.g., https://your-university.edu/dakoda/).
Note: Simple, does not require server-side setup.

### 🏗 **2️⃣ Using SSH & Rsync**
If you have SSH access, Rsync can automate the deployment.

Steps:
1. Build the site locally:
```
npx eleventy
```
2. Use rsync to transfer _site/ to the server:
```
   rsync -avz _site/ username@your-university-server.edu:/var/www/html/dakoda/

```
Replace username and your-university-server.edu with actual credentials.

3. Access the website at https://your-university.edu/dakoda/.
Note: Fast, automatable.

### 🏗 **3️⃣  Git-Based Deployment **
If the university allows Git deployment, you can push the site to a repository and automatically update the server.

Steps:
1. Initialize Git on the university server (One-time setup)
```
ssh username@your-university-server.edu
cd /var/www/html/dakoda
git init --bare

```
2. Set up a post-receive hook (hooks/post-receive file on the server):
```
   #!/bin/sh
GIT_WORK_TREE=/var/www/html/dakoda git checkout -f
```
3. Push your project from local to the server:
```
git remote add university ssh://username@your-university-server.edu:/var/www/html/dakoda.git
git push university main
```
Note: Easy updates by pushing code to Git.

### 🏗 **4️⃣ Deploy Using a Web Server Like Apache or Nginx **
If you have access to Apache or Nginx, you can configure it to serve the site.

Steps:
1. Build the site:
```
npx eleventy
```
2. Copy _site/ to the university server:
```
scp -r _site/ username@your-university-server.edu:/var/www/html/dakoda/
```
3. Configure Apache/Nginx:
For Apache (/etc/apache2/sites-available/dakoda.conf):
```
<VirtualHost *:80>
  ServerName your-university.edu
  DocumentRoot /var/www/html/dakoda/
  <Directory /var/www/html/dakoda/>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```
Enable the site and restart Apache:
```
sudo a2ensite dakoda.conf
sudo systemctl restart apache2
```
For Nginx (/etc/nginx/sites-available/dakoda):
```
server {
  listen 80;
  server_name your-university.edu;
  root /var/www/html/dakoda;
  index index.html;
}
```
Enable the site and restart Nginx:
```
sudo ln -s /etc/nginx/sites-available/dakoda /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```
Note: Easy updates by pushing code to Git.
