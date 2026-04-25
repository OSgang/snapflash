CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS Users (
                                     userId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    userName TEXT NOT NULL,
    passWord_hash TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
-- INSERT INTO Users

CREATE TABLE IF NOT EXISTS Decks(
                                    deckId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID,
    deckName TEXT NOT NULL,
    description TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS ScanHistory(
                                          historyId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID,
    imageURL TEXT,
    extractedText TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE

    );

CREATE TABLE IF NOT EXISTS FlashCards(
                                         flashcardId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deckId UUID,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    definition TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deckId) REFERENCES Decks(deckId) ON DELETE CASCADE
    );