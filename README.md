# FindAServiceBackEnd

## Database Modelling
If you paste the [`db_model.dbml`](https://github.com/LeonidGoldberg/FindAServiceBackEnd/blob/main/db_model.dbml) file into [this page](https://dbdiagram.io/d), it will allow you to visually view and edit the ERD diagram. But don't sign up on the website or save the file on the website because that would make it public. I think we can later fix that if we need to.

The good thing about writing the database model in a `dbml` file is that if we choose to use a relational database such as Postgres, we can convert the `dbml` into an `sql` script that will automatically create all of the tables based on our model.

## Backend Development Instructions
- Backend root:
  - Remote (Azure): https://findaservicebackend.azurewebsites.net/
  - Local: https://localhost:5000/
- PostgreSQL connection string:
  - Remote: postgres://wactuseu:RZ2KaUIpEtvjD_rj3ECzKRucnn6Bu8mr@mel.db.elephantsql.com/wactuseu
  - Local: postgresql://admin:admin@localhost:5432/find_a_service

### To work with the database
1. Install Postgress 
2. Install DataGrip or similar editor (optional because you can use the command line but it helps)
3. Create a local db with the following credentials
  user=admin
  password=admin
  host=localhost
  port=5432
  databse_name=find_a_service
  This is for testing (the frontend will be connected to the remote database on Azure)
4. In the local db run the code in src/dbConfig/init.sql
5. Connect to remote database
  + -> Data Source -> PostgreSQL -> Enter URL
6. Whenever you make any changes to the remote database, update the init.sql file so everyone is on the same page

### To work with the backend
1. Install Node.js
2. After you git clone the repository from the root folder run
```bash
npm init
```
  The node_modules folder should appear in the root folder
3. To start the backend server locally (for testing, the app will be connected to the remote one on Azure) run:
```bash
npm run start:dev
```
  The server should automatically restart whenever you make changes to a file
4. Check the server started by going to http://localhost:5000/
5. You can use Postman to test functionality using the local route

## Folder Structure
.
├── src                 # Source files
│   ├── config          # Any configuration code (e.g. to connect to postgres)
│   ├── helpers         # Any constants or repetitive code
│   ├── routes          # Declares all the routes
│   ├── app.js          # Entrypoint of the server
│   └── middleware.js   # Error handler and authentication handler
├── .env                # Declares environmental variables
├── .gitignore          # Declares which files not to push to github
├── package.json        # Declares Node.js scripts and libraries used
└── README.md

## Routes (so far)

### Providers
- GET     /provider/currentProvider
- POST    /provider/login
- POST    /provider/register