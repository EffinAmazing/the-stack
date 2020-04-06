# Marketing Tools Stack Builder
MTS Builder in below
## Backend Setup

### Installation

The MTS Builder App requires [Node.js](https://nodejs.org/) v12+ to run.
Install the dependencies
```sh
$ cd /[path to MTS Builder]/back
$ npm install -d
```
#### Generate SSL serts 
for **development** and **local** environment 
you need to have installed OpenSSL. you can use this instraction for install on [Windows](https://tecadmin.net/install-openssl-on-windows/), [Linux Ubuntu](https://cloudwafer.com/blog/installing-openssl-on-ubuntu-16-04-18-04/) and [MacOS](http://macappstore.org/openssl/)

1. generate keys:
```sh
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```
2. update path to keys in _backend/app.js_
```javascript
let optionsSSL = {
    key: fs.readFileSync('[path]/key.pem'),
    cert: fs.readFileSync('[path]/cert.pem')
}
```
for **production** environment
**First**, install certbot, copy-paste those lines in a terminal:
```sh
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot
```
**Second**, you will generate an SSL certificate with certbot:
```sh
certbot certonly --manual
```
following by instruction in terminal it will create verification code ([cerbotCode] in follow) and filname of file which need to include this code ([filename] in follow), then create this file by path _/back/public/.well-known/acme-challenge/[filename]_
and then complete verification 
it will genarate SSL keys, you will need path to three files 
1. _[pathKeys]/[domainame]/privkey.pem_
2. _[pathKeys]/[domainame]/cert.pem_
3. _[pathKeys]/[domainame]/chain.pem_
 
**Third**, update path to keys in _/backend/app.js_
```javascript
    const privateKey = fs.readFileSync('[pathKeys]/[domainame]/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('[pathKeys]/[domainame]/cert.pem', 'utf8');
    const ca = fs.readFileSync('[pathKeys]/[domainame]/chain.pem', 'utf8');
```
### Run App
on **Local** enviroment:
```sh
cd back
npm start
```
server will run on __http://localhost:9000__ 

on **Production** enviroment:
1. install _pm2_ module
``
npm install pm2 --global
``
2. run app via pm2 with _NODE_ENV_ variable
``
NODE_ENV=production pm2 start /back/app.js
``

## Front-end Setup
This app used [Angular v9](https://angular.io/docs)

### Installation
The MTS Builder App requires [Node.js](https://nodejs.org/) v12+ to run.
1. install angular 
``
npm install -g @angular/cli
``
2. Install the dependencies
```sh
$ cd /[path to MTS Builder]/front
$ npm install
```
### Run Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Import Fornt to Effin Amazing Website
1. Build production build of front app:
`` ng build --prod``
2. Go to dist directory with app build
``cd /dist/merch-blueprint-front``
3. Copy all **JS**, **CSS** and _assets_ falder and update files in effin amazing wordpress theme _[path to Effin theme]/front-tools_
example: 
```sh
cp main-es2015.[uniqID].js [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp main-es5.[uniqID].js [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp polyfills-es2015.[uniqID].js [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp polyfills-es5.[uniqID].js [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp runtime-es5.[uniqID].js [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp runtime-es2015.[uniqID].js [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp style.[uniqID].css [path to website]/wp-content/themes/genesis-effinamazing/front-tools
cp -Ri ./assets [path to website]/wp-content/themes/genesis-effinamazing/front-tools
```
4. Update path URI of css files in function.php ( _line 116_ )
```PHP
?>
		<base href="<?php print get_permalink(); ?>">
		<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
		<link rel="stylesheet" href="<?php print get_stylesheet_directory_uri(); ?>/front-tools/styles.[uniqID].css">
```
5. Update path for MTS Builder page in theme __march-tools-page.php__
```PHP
?>
<app-root></app-root>

<script src="<?php print get_stylesheet_directory_uri(); ?>/front-tools/runtime-es2015.[uniqID].js" type="module"></script>
<script src="<?php print get_stylesheet_directory_uri(); ?>/front-tools/runtime-es5.[uniqID].js" nomodule defer></script>
<script src="<?php print get_stylesheet_directory_uri(); ?>/front-tools/polyfills-es5.[uniqID].js" nomodule defer></script>
<script src="<?php print get_stylesheet_directory_uri(); ?>/front-tools/polyfills-es2015.[uniqID].js" type="module"></script>
<script src="<?php print get_stylesheet_directory_uri(); ?>/front-tools/main-es2015.[uniqID].js" type="module"></script>
<script src="<?php print get_stylesheet_directory_uri(); ?>/front-tools/main-es5.[uniqID].js" nomodule defer></script>
<?php 
get_footer();
?>
```
6. push udpates to server
