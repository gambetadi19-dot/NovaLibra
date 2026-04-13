ALTER TABLE `books`
  ADD COLUMN `author_id` INT NULL;

UPDATE `books`
SET `author_id` = COALESCE(
  (SELECT `id` FROM `users` WHERE `role` = 'ADMIN' ORDER BY `id` ASC LIMIT 1),
  (SELECT `id` FROM `users` ORDER BY `id` ASC LIMIT 1)
)
WHERE `author_id` IS NULL;

ALTER TABLE `books`
  MODIFY `author_id` INT NOT NULL;

ALTER TABLE `books`
  ADD INDEX `books_author_id_idx` (`author_id`);

ALTER TABLE `books`
  ADD CONSTRAINT `books_author_id_fkey`
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
