# Elastos.Service.Election

## System Requirements

`nodejs v10.x`

`Python v3.6+`

`MySQL/MariaDB 5.5+`

and a running Elastos Node [ELA](https://github.com/elastos/Elastos.ELA) somewhere providing the RPC interface service

This application may not function correctly if the above nodejs and python requirements are not met.

It is recommended to manage the project's nodejs and python environments with [nvm](https://github.com/nvm-sh/nvm/) and [pyenv](https://github.com/pyenv/pyenv), or use something like [asdf-vm](https://github.com/asdf-vm/asdf)



## Download Source and Install Dependencies

Execute the following commands to download the application source and install nodejs and python dependencies: 

```
$ git clone https://github.com/elastos/Elastos.Service.Election.git
$ cd Elastos.Service.Election
$ npm install
$ pip3 install -r requirements.txt
```



## Create Database Schema and Tables

Execute the following command to create a database schema named `crinfo` with relevant tables: 

```
$ mysql -h <host> -p <port> -u <user> -p < crinfo.sql
```



## Setup System Environment Variables

The following environment variables should be set accordingly depending on how you configure the system and network environments.

------

Elastos Node RPC interface settings:

**RPC_IP**: The IP address of a running Elastos Node that provides the RPC interface, default: `"127.0.0.1"`

**RPC_PORT**: The port on which the RPC interface serves, default: `"20336"`

**RPC_PATH**: The path to the RPC interface service, default: `"/"`

------

Elastos DID resolver settings:

**DID_RESOLVER**: The DID Resolver service URL, default: `"http://127.0.0.1:20606"` 

**DID_AUTH**: The Authentication header that needs to be passed to the DID Resolver service, default: `""`

------

MySQL database connection parameters to provide persistent storage for CR related information:

**DB_HOST**:  Database host, default: `"127.0.0.1"`

**DB_PORT**: Database port, default: `"3306"`

**DB_NAME**: Database schema name, default: `"crinfo"`

**DB_USER**: Database login user name, default: `"user"`

**DB_PASS**: Database login password, default: `"password"`

------

Without explicitly setting those environment variables, default values will be used.

Examples setting the environment variables under a Linux bash environment:

```
$ export RPC_IP="127.0.0.1"
$ export RPC_PORT="20336"
$ export RPC_PATH="/"
$ export DID_RESOLVER="http://localhost:20606"
$ export DID_AUTH=""
$ export DB_HOST="localhost"
$ export DB_PORT="3306"
$ export DB_NAME="crinfo"
$ export DB_USER="user"
$ export DB_PASS="password"
```



## Start/Stop the Application

Execute the following command to start the application:

```
$ npm start
```

An application instance will be started and managed with [pm2](https://github.com/Unitech/pm2), and running instance will load configuration parameters from system environment variables. 

Execute the following command to stop the running instance of the application:

```
$ npm stop
```

Execute the following command to monitor the status of the running instance:

```
$ npm run monit
```

You can start the application with some default parameters set for the standard regnet/testnet/mainnet configurations.

For regnet:

```
$ npm run regnet
```

For testnet:

```
$ npm run testnet
```

For mainnet:

```
$ npm run mainnet
```

>  **__NOTE:__** the `run regnet`/`run testnet`/ `run mainnet` npm scripts only sets ***some*** of the configurations for the environments, you still need to set the DB related environment variables and the DID_AUTH setting for them. Also for `mainnet` you need to set the RPC_IP setting. 

