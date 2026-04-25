INSERT INTO Users (userId, email, userName, passWord_hash)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'alice@gmail.com', 'Alice', 'hashed_pw_1'),
    ('22222222-2222-2222-2222-222222222222', 'bob@gmail.com', 'Bob', 'hashed_pw_2');




--Deck 1: Basic English (Alice)
INSERT INTO Decks (deckId, userId, deckName, description)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Basic English', 'Từ vựng cơ bản'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Travel English', 'Từ vựng du lịch'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Programming Terms', 'Thuật ngữ lập trình');

INSERT INTO FlashCards (flashcardId, deckId, word, translation, definition)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'apple', 'táo', 'A fruit that is red or green'),
    ('f1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'book', 'sách', 'A set of pages with text'),
    ('f1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'school', 'trường học', 'Place for education');



--Deck 2: Travel English (Alice)
INSERT INTO FlashCards (flashcardId, deckId, word, translation, definition)
VALUES
    ('f2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'airport', 'sân bay', 'Place where planes take off'),
    ('f2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ticket', 'vé', 'Document to enter transport'),
    ('f2222222-2222-2222-2222-222222222223', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hotel', 'khách sạn', 'Place to stay overnight');



--Programming Terms (Bob)
INSERT INTO FlashCards (flashcardId, deckId, word, translation, definition)
VALUES
    ('f3333333-3333-3333-3333-333333333331', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'variable', 'biến', 'Storage for data in programming'),
    ('f3333333-3333-3333-3333-333333333332', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'function', 'hàm', 'Reusable block of code'),
    ('f3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'database', 'cơ sở dữ liệu', 'Organized data storage system');
