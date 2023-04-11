CREATE TABLE IF NOT EXISTS provider (
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

CREATE TABLE IF NOT EXISTS customer (
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

CREATE TYPE service_category_name AS ENUM (
  'Cleaning',
  'Babysitting',
  'Pest Control',
  'Plumbing',
  'Electrical Repairs',
  'Beauty',
  'Miscellaneous'
);

CREATE TABLE IF NOT EXISTS service (
  id SERIAL PRIMARY KEY,
  title VARCHAR(70) NOT NULL,
  description TEXT NOT NULL,
  provider_id INTEGER NOT NULL,
  price MONEY NOT NULL,
  areas_covered VARCHAR(200)[],
  availability VARCHAR(100)[],
  category service_category_name NOT NULL,
  is_available BOOLEAN DEFAULT false,
  CONSTRAINT fk_provider
    FOREIGN KEY (provider_id)
      REFERENCES provider (id)
);