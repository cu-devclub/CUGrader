CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    picture VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "student" (
    user_id INT PRIMARY KEY REFERENCES "user" (id) ON DELETE CASCADE,
    student_id VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "teacher" (
    user_id INT PRIMARY KEY REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "admin" (
    user_id INT PRIMARY KEY REFERENCES "user" (id) ON DELETE CASCADE,
    added_by INT REFERENCES "user" (id) ON DELETE SET NULL,
    is_superadmin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "picture" (
    id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "class" (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    year INT NOT NULL,
    picture_id INT REFERENCES "picture" (id) ON DELETE SET NULL,
    creator_user_id INT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "class_assistant" (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES "class" (id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    is_leader BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "section" (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES "class" (id) ON DELETE CASCADE,
    section_number INT NOT NULL
);

CREATE TABLE IF NOT EXISTS "group" (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES "class" (id) ON DELETE CASCADE,
    group_name VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS "class_student" (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES "class" (id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    section_id INT NOT NULL REFERENCES "section" (id) ON DELETE CASCADE,
    group_id INT NULL REFERENCES "groups" (id) ON DELETE CASCADE DEFAULT NULL,
    withdrawn BOOLEAN NOT NULL DEFAULT FALSE,
    withdrawn_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "system_language" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    service_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "testcase" (
    id SERIAL PRIMARY KEY,
    testcase_object_id CHAR(24) NOT NULL,
    secret_testcase_object_id CHAR(24) NOT NULL
);

CREATE TABLE IF NOT EXISTS "lab" (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES "class" (id) ON DELETE CASCADE,
    number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    publish TIMESTAMP NOT NULL,
    due TIMESTAMP NOT NULL,
    close_on_due BOOLEAN NOT NULL DEFAULT FALSE,
    exam_mode BOOLEAN NOT NULL DEFAULT FALSE,
    exam_pin VARCHAR(20) NULL DEFAULT NULL,
    show_score_on_lock BOOLEAN NOT NULL DEFAULT FALSE,
    testcase_id INT NOT NULL REFERENCES "testcase" (id) ON DELETE CASCADE,
    description_object_id CHAR(24) NULL DEFAULT NULL,
    lab_testcase_score INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "lab_language" (
    lab_id INT NOT NULL REFERENCES "lab" (id) ON DELETE CASCADE,
    system_language_id INT NOT NULL REFERENCES "system_language" (id) ON DELETE CASCADE,
    PRIMARY KEY (lab_id, system_language_id)
);

CREATE TABLE IF NOT EXISTS "assign_to" (
    id SERIAL PRIMARY KEY,  
    lab_id INT NOT NULL REFERENCES "lab" (id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES "groups" (id) ON DELETE CASCADE,
    PRIMARY KEY (lab_id, group_id)
);

CREATE TABLE IF NOT EXISTS "question" (
    id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL REFERENCES "lab" (id) ON DELETE CASCADE,
    require_question_id INT REFERENCES "question" (id) ON DELETE CASCADE DEFAULT NULL,
    number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    description VARCHAR(24) NOT NULL,
    answer VARCHAR(24) NOT NULL,
    predefine VARCHAR(24) NOT NULL,
    testcase_id INT NOT NULL REFERENCES "testcase" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "multilang_testcase" (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES "question" (id) ON DELETE CASCADE,
    object_id CHAR(24) NOT NULL,
    PRIMARY KEY (question_id, object_id)
);

CREATE TABLE IF NOT EXISTS "multilang_secret_testcase" (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES "question" (id) ON DELETE CASCADE,
    object_id CHAR(24) NOT NULL,
    PRIMARY KEY (question_id, object_id)
);

CREATE TABLE IF NOT EXISTS "addition_files" (
    id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL REFERENCES "lab" (id) ON DELETE CASCADE,
    path VARCHAR(255) NOT NULL,
    UNIQUE(lab_id, path)
);

CREATE TABLE IF NOT EXISTS "submission" (
    id SERIAL PRIMARY KEY,
    class_student_id INT NOT NULL REFERENCES "class_student" (id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES "question" (id) ON DELETE CASCADE,
    system_language_id INT NOT NULL REFERENCES "system_language" (id) ON DELETE CASCADE,
    object_id CHAR(24) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "result" (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES "question" (id) ON DELETE CASCADE,
    submission_id INT NOT NULL REFERENCES "submission" (id) ON DELETE CASCADE,
    testcase_id INT REFERENCES "testcase" (id) ON DELETE CASCADE DEFAULT NULL,
    secret_testcase_id INT REFERENCES "testcase" (id) ON DELETE CASCADE DEFAULT NULL,
    multilang_testcase_id INT REFERENCES "multilang_testcase" (id) ON DELETE CASCADE DEFAULT NULL,
    multilang_secret_testcase_id INT REFERENCES "multilang_secret_testcase" (id) DEFAULT NULL,
    message TEXT NOT NULL,
    score INT NOT NULL,
    is_failed BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
