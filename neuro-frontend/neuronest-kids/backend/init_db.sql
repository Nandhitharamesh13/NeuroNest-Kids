-- NeuroNest Kids Database Initialization
-- Run this file once to set up all required tables.
-- Command: psql -U neuronest_admin -d neuronest -f init_db.sql

-- ── Users table (manual PostgreSQL auth - replaces Supabase Auth) ──────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Child profiles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS child_profiles (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  avatar VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Game sessions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
  game_type VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying a child's game history
CREATE INDEX IF NOT EXISTS idx_game_sessions_child ON game_sessions(child_id);

-- ── Alphabet game extended question bank ─────────────────────────────────────
-- (Optional: can be used to serve questions from DB instead of hardcoded data)
CREATE TABLE IF NOT EXISTS alphabet_questions (
  id SERIAL PRIMARY KEY,
  letter CHAR(1) NOT NULL,
  word VARCHAR(100) NOT NULL,
  emoji VARCHAR(20) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'easy',
  strategy VARCHAR(50) DEFAULT 'start-with',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data - 5+ words per letter
INSERT INTO alphabet_questions (letter, word, emoji, difficulty) VALUES
('A','Apple','🍎','easy'), ('A','Ant','🐜','easy'), ('A','Arrow','🏹','medium'),
('A','Axe','🪓','medium'), ('A','Alligator','🐊','hard'), ('A','Anchor','⚓','hard'),
('B','Ball','⚽','easy'), ('B','Bear','🐻','easy'), ('B','Boat','⛵','easy'),
('B','Butterfly','🦋','medium'), ('B','Banana','🍌','easy'), ('B','Bell','🔔','medium'),
('C','Cat','🐱','easy'), ('C','Car','🚗','easy'), ('C','Cloud','☁️','easy'),
('C','Crown','👑','medium'), ('C','Crab','🦀','medium'), ('C','Castle','🏰','hard'),
('D','Dog','🐶','easy'), ('D','Duck','🦆','easy'), ('D','Drum','🥁','medium'),
('D','Diamond','💎','medium'), ('D','Dragon','🐉','hard'), ('D','Dolphin','🐬','hard'),
('E','Elephant','🐘','easy'), ('E','Egg','🥚','easy'), ('E','Eagle','🦅','medium'),
('E','Earth','🌍','medium'), ('E','Eye','👁️','easy'), ('E','Engine','🚂','hard'),
('F','Fish','🐟','easy'), ('F','Frog','🐸','easy'), ('F','Fire','🔥','easy'),
('F','Flower','🌸','easy'), ('F','Fox','🦊','medium'), ('F','Flag','🚩','medium'),
('G','Grapes','🍇','easy'), ('G','Goat','🐐','easy'), ('G','Ghost','👻','medium'),
('G','Guitar','🎸','medium'), ('G','Gorilla','🦍','hard'), ('G','Gift','🎁','easy'),
('H','House','🏠','easy'), ('H','Hat','🎩','easy'), ('H','Heart','❤️','easy'),
('H','Horse','🐴','easy'), ('H','Hammer','🔨','medium'), ('H','Hippo','🦛','medium'),
('I','Ice cream','🍦','easy'), ('I','Island','🏝️','medium'), ('I','Igloo','🏔️','medium'),
('I','Ink','🖊️','easy'), ('I','Iron','🪣','medium'), ('I','Insect','🦋','hard'),
('J','Juice','🧃','easy'), ('J','Jellyfish','🪼','medium'), ('J','Jar','🫙','easy'),
('J','Jelly','🍮','easy'), ('J','Jungle','🌴','hard'), ('J','Jet','✈️','medium'),
('K','Kite','🪁','easy'), ('K','King','👑','medium'), ('K','Kangaroo','🦘','hard'),
('K','Key','🔑','easy'), ('K','Kettle','🫖','medium'), ('K','Knife','🔪','medium'),
('L','Lion','🦁','easy'), ('L','Leaf','🍃','easy'), ('L','Lamp','💡','easy'),
('L','Lemon','🍋','easy'), ('L','Ladybug','🐞','medium'), ('L','Lock','🔒','medium'),
('M','Moon','🌙','easy'), ('M','Monkey','🐒','easy'), ('M','Mouse','🐭','easy'),
('M','Mountain','⛰️','medium'), ('M','Mushroom','🍄','medium'), ('M','Magnet','🧲','hard'),
('N','Nest','🪺','easy'), ('N','Nose','👃','easy'), ('N','Night','🌃','medium'),
('N','Net','🥅','medium'), ('N','Needle','🪡','hard'), ('N','Nurse','👩‍⚕️','medium'),
('O','Orange','🍊','easy'), ('O','Owl','🦉','easy'), ('O','Ocean','🌊','medium'),
('O','Onion','🧅','medium'), ('O','Octopus','🐙','hard'), ('O','Oak','🌳','medium'),
('P','Penguin','🐧','easy'), ('P','Pizza','🍕','easy'), ('P','Panda','🐼','easy'),
('P','Parrot','🦜','medium'), ('P','Planet','🌍','medium'), ('P','Pineapple','🍍','easy'),
('Q','Queen','👸','easy'), ('Q','Question','❓','medium'), ('Q','Quail','🐦','hard'),
('Q','Quill','✒️','hard'), ('Q','Quartz','💎','hard'),
('R','Rainbow','🌈','easy'), ('R','Rabbit','🐰','easy'), ('R','Robot','🤖','medium'),
('R','Rocket','🚀','medium'), ('R','Ring','💍','easy'), ('R','Rose','🌹','easy'),
('S','Sun','☀️','easy'), ('S','Star','⭐','easy'), ('S','Snake','🐍','easy'),
('S','Shark','🦈','medium'), ('S','Spider','🕷️','medium'), ('S','Sword','⚔️','hard'),
('T','Tree','🌳','easy'), ('T','Tiger','🐯','easy'), ('T','Train','🚂','easy'),
('T','Turtle','🐢','medium'), ('T','Trophy','🏆','medium'), ('T','Thunder','⚡','hard'),
('U','Umbrella','☂️','easy'), ('U','UFO','🛸','medium'), ('U','Unicorn','🦄','medium'),
('U','Union','🤝','hard'), ('U','Urn','🏺','hard'),
('V','Violin','🎻','easy'), ('V','Volcano','🌋','medium'), ('V','Van','🚐','easy'),
('V','Vest','🦺','medium'), ('V','Vine','🌿','medium'), ('V','Viking','⚔️','hard'),
('W','Whale','🐋','easy'), ('W','Wolf','🐺','easy'), ('W','Worm','🪱','medium'),
('W','Watermelon','🍉','easy'), ('W','Wizard','🧙','medium'), ('W','Watch','⌚','medium'),
('X','Xylophone','🎹','easy'), ('X','X-ray','🩻','medium'), ('X','Xenon','⚗️','hard'),
('Y','Yacht','⛵','easy'), ('Y','Yak','🐂','medium'), ('Y','Yo-yo','🪀','easy'),
('Y','Yellow','💛','easy'), ('Y','Yard','🏡','medium'),
('Z','Zebra','🦓','easy'), ('Z','Zip','🤐','medium'), ('Z','Zero','0️⃣','easy'),
('Z','Zoo','🦁','easy'), ('Z','Zeppelin','🛸','hard')
ON CONFLICT DO NOTHING;

-- ── Summary ──────────────────────────────────────────────────────────────────
-- Tables created:
--   users              → Parent accounts (manual JWT auth)
--   child_profiles     → Child data linked to parent
--   game_sessions      → Tracks each game play
--   alphabet_questions → Extended alphabet question bank (130+ entries)
