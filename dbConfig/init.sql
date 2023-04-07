CREATE TABLE provider (
  id SERIAL PRIMARY KEY
, first_name VARCHAR(255) NOT NULL
, last_name VARCHAR(255) NOT NULL
, email VARCHAR(255) UNIQUE NOT NULL
, password VARCHAR(255) NOT NULL
, description VARCHAR(255) NOT NULL
, address VARCHAR(255) NOT NULL
, is_approved BOOLEAN NOT NULL DEFAULT false
, is_available BOOLEAN NOT NULL DEFAULT false
, profile_image VARCHAR(255)
);

CREATE TABLE customer (
  id SERIAL PRIMARY KEY
, first_name VARCHAR(255) NOT NULL
, last_name VARCHAR(255) NOT NULL
, email VARCHAR(255) UNIQUE NOT NULL
, password VARCHAR(255) 
, profile_image VARCHAR(255)
, google_sub VARCHAR(255)
, email_verified BOOLEAN DEFAULT false
, email_token VARCHAR(255)
);