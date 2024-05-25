CREATE TABLE messages (
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sys_ctime DATETIME DEFAULT CURRENT_TIMESTAMP
);
