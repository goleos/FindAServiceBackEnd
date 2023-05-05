CREATE TYPE update_status AS ENUM ('pending', 'completed');

CREATE TABLE IF NOT EXISTS provider (
  id SERIAL PRIMARY KEY
, first_name VARCHAR(255) NOT NULL
, last_name VARCHAR(255) NOT NULL
, email VARCHAR(255) UNIQUE NOT NULL
, password VARCHAR(255) NOT NULL
, description TEXT NOT NULL
, address VARCHAR(255) NOT NULL
, is_approved BOOLEAN NOT NULL DEFAULT false
, is_available BOOLEAN NOT NULL DEFAULT true
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

CREATE TYPE service_request_status AS ENUM (
  'accepted',
  'request_further_details',
  'rejected',
  'pending',
  'completed',
  'withdrawn'
);

CREATE TABLE IF NOT EXISTS service (
  id SERIAL PRIMARY KEY,
  title VARCHAR(70) NOT NULL,
  description TEXT NOT NULL,
  provider_id INTEGER NOT NULL,
  price NUMERIC(6, 2)  NOT NULL,
  areas_covered VARCHAR(200)[],
  availability VARCHAR(100)[],
  category service_category_name NOT NULL,
  service_images VARCHAR(255) [],
  is_available BOOLEAN DEFAULT true,
  CONSTRAINT fk_provider
    FOREIGN KEY (provider_id)
      REFERENCES provider (id)
);

CREATE TABLE IF NOT EXISTS profile_update (
  id SERIAL PRIMARY KEY
, provider_id INT REFERENCES provider (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
, reason VARCHAR(255) NOT NULL
, status update_status NOT NULL
, created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS service_request (
  id SERIAL PRIMARY KEY
, provider_id INT REFERENCES provider (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
, customer_id INT REFERENCES customer (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
, service_id INT REFERENCES service (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
, description VARCHAR(255) NOT NULL
, status service_request_status NOT NULL
, customer_address VARCHAR(255) NOT NULL
, booking_time DATE NOT NULL
, created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS service_request_update (
  id SERIAL PRIMARY KEY
, service_request_id INT REFERENCES service_request (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
, reason VARCHAR(255) NOT NULL
, status update_status NOT NULL
, created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS review(
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customer (id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
  service_id INT REFERENCES service (id)
      ON UPDATE CASCADE
      ON DELETE CASCADE,
  title VARCHAR(70) NOT NULL,
  description TEXT NOT NULL,
--   rating goes from 1 to 5
  rating INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE notification_type AS ENUM ('service_completed', 'new_service');

CREATE TABLE IF NOT EXISTS notification (
  id SERIAL PRIMARY KEY
, provider_id INT REFERENCES provider (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, customer_id INT REFERENCES customer (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, service_id INT REFERENCES service (id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE
, date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
, type notification_type NOT NULL
, read BOOLEAN DEFAULT false
);
