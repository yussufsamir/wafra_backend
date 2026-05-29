CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) CHECK (
        role IN ('restaurant', 'individual', 'foodbank', 'admin')
    ),

    verification_status VARCHAR(20) DEFAULT 'incomplete' CHECK (
        verification_status IN ('incomplete', 'pending', 'approved', 'rejected')
    ),

    is_email_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(25) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    restaurant_name VARCHAR(150) NOT NULL,
    cuisine_type VARCHAR(100),
    full_address TEXT,
    phone VARCHAR(20),
    business_license_number VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS food_banks (
    food_bank_id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    organization_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(100),
    phone VARCHAR(20),
    location TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS individuals (
    individual_id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    birthdate DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS food_listings (
    listing_id SERIAL PRIMARY KEY,

    restaurant_id INT NOT NULL,

    food_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    quantity DOUBLE PRECISION NOT NULL CHECK (quantity >= 0),

    pickup_time TIMESTAMP NOT NULL,
    location TEXT,

    photo_url TEXT,
    dietary_tags TEXT,

    status VARCHAR(20) DEFAULT 'available' CHECK (
        status IN ('available', 'reserved', 'completed', 'cancelled')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS reservations (
    reservation_id SERIAL PRIMARY KEY,

    listing_id INT NOT NULL,
    user_id INT NOT NULL,

    requested_quantity DOUBLE PRECISION NOT NULL CHECK (requested_quantity > 0),

    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (listing_id) REFERENCES food_listings(listing_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS pickups (
    pickup_id SERIAL PRIMARY KEY,

    reservation_id INT UNIQUE NOT NULL,

    code VARCHAR(10) NOT NULL UNIQUE,

    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'used', 'expired')
    ),

    expires_at TIMESTAMP,
    confirmed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);



