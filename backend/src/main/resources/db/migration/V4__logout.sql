CREATE TABLE IF NOT EXISTS invalid_jwt_tokens(
    id TEXT PRIMARY KEY,
    expiry_time TIMESTAMP NOT NULL
);