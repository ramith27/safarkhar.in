ALTER TABLE vehicles ADD COLUMN user_id text;
ALTER TABLE wallets ADD COLUMN user_id text;
ALTER TABLE trips ADD COLUMN user_id text;

UPDATE vehicles SET user_id = 'legacy' WHERE user_id IS NULL;
UPDATE wallets SET user_id = 'legacy' WHERE user_id IS NULL;
UPDATE trips SET user_id = 'legacy' WHERE user_id IS NULL;

ALTER TABLE vehicles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE wallets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE trips ALTER COLUMN user_id SET NOT NULL;
