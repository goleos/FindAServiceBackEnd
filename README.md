# FindAServiceBackEnd

## Database Modelling
If you paste the [`db_model.dbml`](https://github.com/LeonidGoldberg/FindAServiceBackEnd/blob/main/db_model.dbml) file into [this page](https://dbdiagram.io/d), it will allow you to visually view and edit the ERD diagram. But don't sign up on the website or save the file on the website because that would make it public. I think we can later fix that if we need to.

The good thing about writing the database model in a `dbml` file is that if we choose to use a relational database such as Postgres, we can convert the `dbml` into an `sql` script that will automatically create all of the tables based on our model.
