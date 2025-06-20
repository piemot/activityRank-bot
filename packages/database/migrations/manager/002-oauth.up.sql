CREATE TABLE `session` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `user_id` bigint(20) NOT NULL REFERENCES web_user(id),
  `expires_at` datetime NOT NULL
);

CREATE TABLE `web_user` (
  `id` bigint(20) NOT NULL PRIMARY KEY,
  `username` varchar(32) NOT NULL UNIQUE,
  `avatar_hash` varchar(32) DEFAULT NULL
);
